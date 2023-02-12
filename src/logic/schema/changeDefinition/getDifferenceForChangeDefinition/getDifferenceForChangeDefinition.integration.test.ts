import sha256 from 'simple-sha256';
import uuid from 'uuid/v4';
import {
  DatabaseLanguage,
  DatabaseConnection,
  ControlConfig,
  ChangeDefinition,
  ChangeDefinitionStatus,
} from '../../../../types';
import { initializeControlEnvironment } from '../../../config/initializeControlEnvironment';
import { getDifferenceForChangeDefinition } from './getDifferenceForChangeDefinition';
import { promiseConfig } from '../../../../__test_assets__/connection.config';

describe('getDifferenceForChangeDefinition', () => {
  let connection: DatabaseConnection;
  beforeAll(async () => {
    const config = new ControlConfig({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: (await promiseConfig()).mysql,
      definitions: [],
      strict: true,
    });
    ({ connection } = await initializeControlEnvironment({ config })); // ensure db is provisioned and get connection
  });
  afterAll(async () => {
    await connection.end();
  });
  it('should find that a change that is up to date has no difference', async () => {
    // define the change
    const sql = `
    CREATE TABLE IF NOT EXISTS some_table (
      id              INT(11) PRIMARY KEY AUTO_INCREMENT,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    ) ENGINE = InnoDB;
    `;
    const definition = new ChangeDefinition({
      id: uuid(),
      path: '__PATH__',
      sql,
      hash: sha256.sync(sql),
    });

    // apply it
    await connection.query({
      sql: `
      INSERT INTO schema_control_change_log
        (change_id, change_hash, change_content)
      VALUES
        ('${definition.id}', '${definition.hash}', '${definition.sql}');
    `,
    });

    // show that there is no diff
    const result = await getDifferenceForChangeDefinition({ connection, change: definition });
    expect(result).toEqual(null);
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
    await connection.query({
      sql: `
      INSERT INTO schema_control_change_log
        (change_id, change_hash, change_content)
      VALUES
        ('${definition.id}', '${definition.hash}', '${definition.sql}');
    `,
    });

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
    const result = await getDifferenceForChangeDefinition({ connection, change: updatedDefinition });
    expect(typeof result).toEqual('string');
    expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
  });
});
