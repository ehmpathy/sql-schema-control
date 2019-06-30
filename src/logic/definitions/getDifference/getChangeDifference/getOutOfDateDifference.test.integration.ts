import sha256 from 'simple-sha256';
import uuid from 'uuid/v4';
import { DatabaseLanguage, DatabaseConnection, ControlConfig, ChangeDefinition, ChangeDefinitionStatus } from '../../../../types';
import { promiseConfig } from './_test_assets/connection.config';
import { initializeControlEnvironment } from '../../../config/initializeControlEnvironment';
import { getOutOfDateDifference } from './getOutOfDateDifference';

describe('getOutOfDateDifference', () => {
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
  it('should throw an error if the ChangeDefinition.status !== OUT_OF_DATE', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.NOT_APPLIED,
    });
    try {
      await getOutOfDateDifference({ connection, change: definition });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual(`change.status must be ${ChangeDefinitionStatus.OUT_OF_DATE} to get diff`);
    }
  });
  it('should find that an out of date change has a colored diff of changed lines', async () => {
    // record that the definition was already applied
    const definition = new ChangeDefinition({
      id: uuid(),
      path: '__PATH__',
      sql: `
CREATE TABLE IF NOT EXISTS some_table (
  id              INT(11) PRIMARY KEY AUTO_INCREMENT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
) ENGINE = InnoDB;
      `,
      hash: sha256.sync(''),
    });
    await connection.query({ sql: `
      INSERT INTO schema_control_change_log
        (change_id, change_hash, change_content)
      VALUES
        ('${definition.id}', '${definition.hash}', '${definition.sql}');
    ` });

    // update the original definition
    const updatedDefinition = new ChangeDefinition({
      ...definition,
      sql: `
CREATE TABLE IF NOT EXISTS some_table (
id              BIGINT PRIMARY KEY AUTO_INCREMENT,
created_at      DATETIME(3) DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;
      `,
      hash: sha256.sync('2'),
      status: ChangeDefinitionStatus.OUT_OF_DATE,
    });

    // get the diff
    const result = await getOutOfDateDifference({ connection, change: updatedDefinition });
    expect(typeof result).toEqual('string');
    expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
  });
});
