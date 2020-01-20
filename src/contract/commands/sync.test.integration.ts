import Sync from './sync';
import { stdout } from 'stdout-stderr';
import { DatabaseConnection, DatabaseLanguage, ControlConfig } from '../../types';
import { promiseConfig } from '../__test_assets__/connection.config';
import { initializeControlEnvironment } from '../../logic/config/initializeControlEnvironment';

describe('sync', () => {
  let connection: DatabaseConnection;
  beforeAll(async () => {
    const config = new ControlConfig({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: await promiseConfig(),
      definitions: [],
      strict: false,
    });
    ({ connection } = await initializeControlEnvironment({ config })); // ensure db is provisioned and get connection
  });
  afterAll(async () => {
    await connection.end();
  });
  it('should have an expected appearance when syncing change log for a change definition', async () => {
    // ensure previous runs dont break this test
    await connection.query({ sql: 'DROP USER IF EXISTS user_name' });
    await connection.query({ sql: 'DELETE FROM schema_control_change_log' });

    // run the test
    process.stdout.isTTY = undefined; // since listr acts differently if nonTTY and jest is nonTTY when more than one test is run
    stdout.stripColor = false; // dont strip color
    // stdout.print = true;
    stdout.start();
    await Sync.run(['-c', `${__dirname}/../__test_assets__/control.yml`, '--id', 'change:init_service_user']);
    stdout.stop();
    const output = stdout.output
      .split('\n')
      .filter((line) => !line.includes('console.log'))
      .join('\n') // strip the console log portion
      .replace(/\[\d\d:\d\d:\d\d\]/g, ''); // remove all timestamps, since they change over time...
    expect(output).toMatchSnapshot();
    process.stdout.isTTY = true;
  });
});
