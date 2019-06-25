import sha256 from 'simple-sha256';
import uuid from 'uuid/v4';
import { ControlContext, ChangeDefinition, ChangeDefinitionStatus, DefinitionType } from '../../../../types';
import { getControlContextFromConfig } from '../../../config/getControlContextFromConfig';
import { getChangeStatus } from './getChangeStatus';

describe('getChangeStatus', () => {
  let context: ControlContext;
  beforeAll(async () => {
    context = await getControlContextFromConfig({ configPath: `${__dirname}/_test_assets/control.yml` });
  });
  afterAll(async () => {
    await context.connection.end();
  });
  it('should find that an unapplied change has status of NOT_APPLIED', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    });
    const result = await getChangeStatus({ connection: context.connection, change: definition });
    expect(result.constructor).toEqual(ChangeDefinition);
    expect(result.status).toEqual(ChangeDefinitionStatus.NOT_APPLIED);
  });
  it('should find that an applied change has status of UP_TO_DATE', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    });

    // record that the definition was already applied
    await context.connection.query({ sql: `
      INSERT INTO schema_control_change_log
        (change_id, change_hash, change_content)
      VALUES
        ('${definition.id}', '${definition.hash}', '${definition.sql}');
    ` });

    // get the status
    const result = await getChangeStatus({ connection: context.connection, change: definition });
    expect(result.constructor).toEqual(ChangeDefinition);
    expect(result.status).toEqual(ChangeDefinitionStatus.UP_TO_DATE);
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
    });

    // get the status
    const result = await getChangeStatus({ connection: context.connection, change: updatedDefinition });
    expect(result.constructor).toEqual(ChangeDefinition);
    expect(result.status).toEqual(ChangeDefinitionStatus.OUT_OF_DATE);
  });
});
