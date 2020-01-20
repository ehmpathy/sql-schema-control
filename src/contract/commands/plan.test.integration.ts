import Plan from './plan';
import { stdout } from 'stdout-stderr';
import { DatabaseConnection, DatabaseLanguage, ControlConfig } from '../../types';
import { promiseConfig } from '../__test_assets__/connection.config';
import { initializeControlEnvironment } from '../../logic/config/initializeControlEnvironment';

describe('plan', () => {
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
  it('should have an expected appearance when all changes need to be applied', async () => {
    // ensure previous runs dont break this test
    await connection.query({ sql: 'DELETE FROM schema_control_change_log' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS notification_version' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS notification' });
    await connection.query({ sql: 'DROP FUNCTION IF EXISTS find_message_hash_by_text' });
    await connection.query({ sql: 'DROP PROCEDURE IF EXISTS upsert_message' });

    // run plan
    stdout.stripColor = false; // dont strip color
    stdout.start();
    await Plan.run(['-c', `${__dirname}/../__test_assets__/control.yml`]);
    stdout.stop();
    const output = stdout.output
      .split('\n')
      .filter((line) => !line.includes('console.log'))
      .join('\n');
    expect(output).toMatchSnapshot();
  });
  it('should have an expected appearance when some resources need to be reapplied manually or automatically', async () => {
    // ensure previous runs dont break this test
    await connection.query({ sql: 'DELETE FROM schema_control_change_log' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS notification_version' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS notification' });
    await connection.query({ sql: 'DROP FUNCTION IF EXISTS find_message_hash_by_text' });
    await connection.query({ sql: 'DROP PROCEDURE IF EXISTS upsert_message' });

    // pre-provision two of the resources with different def (one reappliable, one not)
    const findMessageHashByTextAltSql = `
CREATE FUNCTION find_message_hash_by_text(
  in_message TEXT
)
RETURNS CHAR(64)
BEGIN
  RETURN SHA2(in_message, 256);
END;
    `.trim();
    await connection.query({ sql: findMessageHashByTextAltSql });
    const notificationVersionTableAltSql = `
CREATE TABLE notification_version (
  -- meta
  notification_id BIGINT NOT NULL, -- fk pointing to static entity
  effective_at DATETIME(3) NOT NULL, -- the user should define the effective_at timestamp
  PRIMARY KEY (notification_id, effective_at)
) ENGINE = InnoDB;
    `.trim();
    await connection.query({ sql: notificationVersionTableAltSql });

    // run plan
    stdout.stripColor = false; // dont strip color
    stdout.start();
    await Plan.run(['-c', `${__dirname}/../__test_assets__/control.yml`]);
    stdout.stop();
    const output = stdout.output
      .split('\n')
      .filter((line) => !line.includes('console.log'))
      .join('\n');
    expect(output).toMatchSnapshot();
  });
  it('should find uncontrolled resources when strict=true', async () => {
    // ensure previous runs dont break this test
    await connection.query({ sql: 'DELETE FROM schema_control_change_log' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS notification_version' });
    await connection.query({ sql: 'DROP TABLE IF EXISTS notification' });
    await connection.query({ sql: 'DROP FUNCTION IF EXISTS find_message_hash_by_text' });
    await connection.query({ sql: 'DROP PROCEDURE IF EXISTS upsert_message' });

    // run plan
    stdout.stripColor = false; // dont strip color
    stdout.start();
    await Plan.run(['-c', `${__dirname}/../__test_assets__/strict_control.yml`]); // seperate schema since we don't want snapshot to break due to uncontrolled
    stdout.stop();
    const output = stdout.output
      .split('\n')
      .filter((line) => !line.includes('console.log'))
      .join('\n');
    expect(output).toContain('[MANUAL_PULL]'); // we guarentee that the other tests will provision uncontrolled resources for us to find atleast one of
  });
});
