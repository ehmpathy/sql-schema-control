import Apply from './apply';
import { stdout } from 'stdout-stderr';
import { DatabaseConnection, DatabaseLanguage, ControlConfig } from '../../types';
import { promiseConfig } from '../_test_assets/connection.config';
import { initializeControlEnvironment } from '../../logic/config/initializeControlEnvironment';

describe('plan', () => {
  let connection: DatabaseConnection;
  beforeAll(async () => {
    const config = new ControlConfig({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: await promiseConfig(),
      definitions: [],
    });
    ({ connection } = await initializeControlEnvironment({ config })); // ensure db is provisioned and get connection
  });
  afterAll(async () => {
    await connection.end();
  });
  it('should have an expected appearance when all changes need to be applied', async () => {
    // ensure previous runs dont break this test
    await connection.query({ sql: 'DROP USER IF EXISTS user_name' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS data_source' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS notification_version' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS notification' });
    await connection.query({ sql: 'DELETE FROM schema_control_change_log' });

    // run the test
    process.stdout.isTTY = true; // since listr acts differently if nonTTY and jest is nonTTY when more than one plans
    stdout.stripColor = false; // dont strip color
    stdout.start();
    await Apply.run(['-c', `${__dirname}/../_test_assets/control.yml`]);
    stdout.stop();
    const output = stdout.output.split('\n').filter(line => !line.includes('console.log')).join('\n');
    console.log(output);
    expect(output).toMatchSnapshot();
  });
});