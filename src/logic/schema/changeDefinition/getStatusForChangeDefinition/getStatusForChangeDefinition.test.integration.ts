import sha256 from 'simple-sha256';
import uuid from 'uuid/v4';

import {
  ChangeDefinition,
  ChangeDefinitionStatus,
  ControlConfig,
  DatabaseConnection,
  DatabaseLanguage,
} from '../../../../types';
import { initializeControlEnvironment } from '../../../config/initializeControlEnvironment';
import { getStatusForChangeDefinition } from './getStatusForChangeDefinition';
import { promiseConfig } from '../../../__test_assets__/connection.config';

describe('getStatusForChangeDefinition', () => {
  let connection: DatabaseConnection;
  beforeAll(async () => {
    const config = new ControlConfig({
      language: DatabaseLanguage.POSTGRES,
      dialect: '10.7',
      connection: (await promiseConfig()).postgres,
      definitions: [],
      strict: true,
    });
    ({ connection } = await initializeControlEnvironment({ config })); // ensure db is provisioned and get connection
  });
  afterAll(async () => {
    await connection.end();
  });
  it('should find that an unapplied change has status of NOT_APPLIED', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    });
    const status = await getStatusForChangeDefinition({ connection, change: definition });
    expect(status).toEqual(ChangeDefinitionStatus.NOT_APPLIED);
  });
  it('should find that an applied change has status of UP_TO_DATE', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    });

    // record that the definition was already applied
    await connection.query({
      sql: `
      INSERT INTO schema_control_change_log
        (change_id, change_hash, change_content)
      VALUES
        ('${definition.id}', '${definition.hash}', '${definition.sql}');
    `,
    });

    // get the status
    const status = await getStatusForChangeDefinition({ connection, change: definition });
    expect(status).toEqual(ChangeDefinitionStatus.UP_TO_DATE);
  });
  it('should find that an applied change with a different hash has status of OUT_OF_DATE', async () => {
    // record that the definition was already applied
    const definition = new ChangeDefinition({
      id: uuid(),
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
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
      sql: '__SQL_2__',
      hash: sha256.sync('__SQL_2__'),
    });

    // get the status
    const status = await getStatusForChangeDefinition({ connection, change: updatedDefinition });
    expect(status).toEqual(ChangeDefinitionStatus.OUT_OF_DATE);
  });
});
