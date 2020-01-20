import { pullResources } from './pullResources';
import { DatabaseConnection, DatabaseLanguage, ControlConfig, ResourceDefinition } from '../../../../../types';
import { promiseConfig } from './__test_assets__/connection.config';
import { initializeControlEnvironment } from '../../../../config/initializeControlEnvironment';

describe('pullResources', () => {
  let connection: DatabaseConnection;
  beforeAll(async () => {
    const config = new ControlConfig({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: await promiseConfig(),
      definitions: [],
      strict: true,
    });
    ({ connection } = await initializeControlEnvironment({ config })); // ensure db is provisioned and get connection
  });
  afterAll(async () => {
    await connection.end();
  });
  it('should be able to find an existing table', async () => {
    await connection.query({ sql: 'DROP TABLE IF EXISTS test_table_pull' }); // ensure possible previous state does not affect test
    await connection.query({ sql: 'CREATE TABLE test_table_pull ( id BIGINT )' });
    const resources = await pullResources({ connection });
    resources.forEach((resource) => expect(resource.constructor).toEqual(ResourceDefinition));
    const createdResource = resources.find((resource) => resource.name === 'test_table_pull');
    expect(createdResource).not.toEqual(undefined);
  });
  it('should be able to find an existing function', async () => {
    await connection.query({ sql: 'DROP FUNCTION IF EXISTS f_some_function_for_testing_pull;' }); // ensure possible previous state does not affect test
    await connection.query({
      sql: `
CREATE FUNCTION f_some_function_for_testing_pull(
  in_message TEXT
)
RETURNS BINARY(32)
BEGIN
  RETURN UNHEX(SHA(in_message)); -- some comment
END;
    `,
    });
    const resources = await pullResources({ connection });
    resources.forEach((resource) => expect(resource.constructor).toEqual(ResourceDefinition));
    const createdResource = resources.find((resource) => resource.name === 'f_some_function_for_testing_pull');
    expect(createdResource).not.toEqual(undefined);
  });
  it('should be able to find an existing procedure', async () => {
    await connection.query({ sql: 'DROP PROCEDURE IF EXISTS upsert_some_entity_for_pull;' }); // ensure possible previous state does not affect test
    await connection.query({
      sql: `
CREATE PROCEDURE upsert_some_entity_for_pull(
  IN in_value TEXT
)
BEGIN
  SELECT true;
END;
    `,
    });
    const resources = await pullResources({ connection });
    resources.forEach((resource) => expect(resource.constructor).toEqual(ResourceDefinition));
    const createdResource = resources.find((resource) => resource.name === 'upsert_some_entity_for_pull');
    expect(createdResource).not.toEqual(undefined);
  });
});
