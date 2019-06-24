import sha256 from 'simple-sha256';
import uuid from 'uuid/v4';
import { ControlContext, ChangeDefinition, ChangeDefinitionStatus, DefinitionType, ChangeDefinitionOutOfDateDiff } from '../../../../types';
import { getControlContextFromConfig } from '../../../config/getControlContextFromConfig';
import { getChangeDifference } from './getChangeDifference';

describe('getChangeStatus', () => {
  let context: ControlContext;
  beforeAll(async () => {
    context = await getControlContextFromConfig({ configPath: `${__dirname}/../../../../_test_assets/control.yml` });
  });
  afterAll(async () => {
    await context.connection.end();
  });
  it('should throw an error if the ChangeDefinition.status !== OUT_OF_DATE', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    });
    try {
      await getChangeDifference({ context, change: definition });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual(`change.status must be ${ChangeDefinitionStatus.OUT_OF_DATE} to get diff`);
    }
  });
  it('should find that an applied change with a different hash has status of OUT_OF_DATE', async () => {
    // record that the definition was already applied
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
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
      sql: '__SQL_2__',
      hash: sha256.sync('__SQL_2__'),
      status: ChangeDefinitionStatus.OUT_OF_DATE,
    });

    // get the diff
    const result = await getChangeDifference({ context, change: updatedDefinition });
    expect(result.constructor).toEqual(ChangeDefinitionOutOfDateDiff);
    expect(result.sqlDiff).toEqual({
      database: definition.sql,
      definition: updatedDefinition.sql,
    });
    expect(result.hashDiff).toEqual({
      database: definition.hash,
      definition: updatedDefinition.hash,
    });
  });
});
