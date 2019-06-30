import { DatabaseConnection, ControlConfig, DatabaseLanguage, ResourceDefinition, ResourceDefinitionStatus, ResourceType } from '../../../../types';
import { getOutOfDateDifference } from './getOutOfDateDifference';
import { promiseConfig } from './_test_assets/connection.config';
import { initializeControlEnvironment } from '../../../config/initializeControlEnvironment';

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
  it('should throw an error if the ResourceDefinition.status !== OUT_OF_SYNC', async () => {
    const definition = new ResourceDefinition({
      type: ResourceType.TABLE,
      name: '__NAME__',
      path: '__PATH__',
      sql: '__SQL__',
    });
    try {
      await getOutOfDateDifference({ connection, resource: definition });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual(`change.status must be ${ResourceDefinitionStatus.OUT_OF_SYNC} to get diff`);
    }
  });
  it('should find that an out of date table resource has a colored diff of changed lines', async () => {
    await connection.query({ sql: 'DROP TABLE IF EXISTS some_resource_table' });

    // apply the resource
    const definition = new ResourceDefinition({
      type: ResourceType.TABLE,
      name: 'some_resource_table',
      path: '__PATH__',
      sql: `
CREATE TABLE \`some_resource_table\` (
  \`id\` INT(11) AUTO_INCREMENT,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `,
      status: ResourceDefinitionStatus.OUT_OF_SYNC,
    });
    await connection.query({ sql: definition.sql });

    // update the original definition
    const updatedDefinition = new ResourceDefinition({
      ...definition,
      sql: `
CREATE TABLE \`some_resource_table\` (
  \`id\` BIGINT AUTO_INCREMENT,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `,
    });

    // get the diff
    const result = await getOutOfDateDifference({ connection, resource: updatedDefinition });
    expect(typeof result).toEqual('string');
    expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
  });
  it('should find that an out of date procedure resource has a colored diff of changed lines', async () => {
    await connection.query({ sql: 'DROP PROCEDURE IF EXISTS upsert_user_description' });

    // apply the resource
    const definition = new ResourceDefinition({
      type: ResourceType.PROCEDURE,
      name: 'upsert_user_description',
      path: '__PATH__',
      sql: `
CREATE PROCEDURE upsert_user_description(
  IN in_from_user_id BIGINT
)
BEGIN
  -- just select something, and also include a comment
  SELECT false;
END;
      `,
      status: ResourceDefinitionStatus.OUT_OF_SYNC,
    });
    await connection.query({ sql: definition.sql });

    // update the original definition
    const updatedDefinition = new ResourceDefinition({
      ...definition,
      sql: `
CREATE PROCEDURE upsert_user_description(
  IN in_from_user_id BIGINT
)
BEGIN
  -- just select something, and also include a comment
  SELECT true;
END
      `,
    });

    // get the diff
    const result = await getOutOfDateDifference({ connection, resource: updatedDefinition });
    expect(typeof result).toEqual('string');
    expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
  });
});
