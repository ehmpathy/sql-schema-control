import Pull from './pull';
import { stdout } from 'stdout-stderr';
import { DatabaseConnection, DatabaseLanguage, ControlConfig } from '../../types';
import { promiseConfig } from '../__test_assets__/connection.config';
import { initializeControlEnvironment } from '../../logic/config/initializeControlEnvironment';

describe('pull', () => {
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
  it('should find uncontrolled resources and be able to pull them when strict=true', async () => {
    // ensure previous runs dont break this test
    await connection.query({ sql: 'DELETE FROM schema_control_change_log' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS notification_version' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS notification' });
    await connection.query({ sql: 'DROP FUNCTION IF EXISTS find_message_hash_by_text' });
    await connection.query({ sql: 'DROP PROCEDURE IF EXISTS upsert_message' });

    // run plan
    stdout.stripColor = false; // dont strip color
    stdout.start();
    await Pull.run([
      '-c',
      `${__dirname}/../__test_assets__/control.yml`, // note how the config does not need to be strict for this to work
      '-t',
      `${__dirname}/../__test_assets__/uncontrolled`,
    ]);
    stdout.stop();
    const output = stdout.output
      .split('\n')
      .filter((line) => !line.includes('console.log'))
      .join('\n');
    expect(output).toContain('[PULLED]'); // output should say "recorded"
  });
});
