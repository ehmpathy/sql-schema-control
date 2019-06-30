import Plan from './plan';
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
    await connection.query({ sql: 'DELETE FROM schema_control_change_log' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS notification_version' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS notification' });
    await connection.query({ sql: 'DROP PROCEDURE IF EXISTS find_message_hash_by_text' });
    await connection.query({ sql: 'DROP PROCEDURE IF EXISTS upsert_message' });

    // run plan
    stdout.stripColor = false; // dont strip color
    stdout.start();
    await Plan.run(['-c', `${__dirname}/../_test_assets/control.yml`]);
    stdout.stop();
    const output = stdout.output.split('\n').filter(line => !line.includes('console.log')).join('\n');
    expect(output).toMatchSnapshot();
  });
});
