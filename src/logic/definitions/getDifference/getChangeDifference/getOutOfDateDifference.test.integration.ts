import sha256 from 'simple-sha256';
import uuid from 'uuid/v4';
import { ControlContext, ChangeDefinition, ChangeDefinitionStatus, DefinitionType } from '../../../../types';
import { getControlContextFromConfig } from '../../../config/getControlContextFromConfig';
import { getOutOfDateDifference } from './getOutOfDateDifference';

describe('getOutOfDateDifference', () => {
  let context: ControlContext;
  beforeAll(async () => {
    context = await getControlContextFromConfig({ configPath: `${__dirname}/_test_assets/control.yml` });
  });
  afterAll(async () => {
    await context.connection.end();
  });
  it('should throw an error if the ChangeDefinition.status !== OUT_OF_DATE', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.NOT_APPLIED,
    });
    try {
      await getOutOfDateDifference({ connection: context.connection, change: definition });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual(`change.status must be ${ChangeDefinitionStatus.OUT_OF_DATE} to get diff`);
    }
  });
  it('should find that an out of date change has a colored diff of changed lines', async () => {
    // record that the definition was already applied
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      path: '__PATH__',
      sql: `
CREATE TABLE IF NOT EXISTS some_table (
  id              INT(11) PRIMARY KEY AUTO_INCREMENT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
) ENGINE = InnoDB;
      `,
      hash: sha256.sync(''),
    });
    await context.connection.query({ sql: `
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
    const result = await getOutOfDateDifference({ connection: context.connection, change: updatedDefinition });
    expect(typeof result).toEqual('string');
    expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
  });
});
