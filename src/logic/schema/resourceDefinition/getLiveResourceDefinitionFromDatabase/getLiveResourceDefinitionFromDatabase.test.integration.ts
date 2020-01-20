import {
  getLiveResourceDefinitionFromDatabase,
  ResourceDoesNotExistError,
} from './getLiveResourceDefinitionFromDatabase';
import {
  DatabaseConnection,
  DatabaseLanguage,
  ControlConfig,
  ResourceDefinition,
  ResourceType,
} from '../../../../types';
import { promiseConfig } from './__test_assets__/connection.config';
import { initializeControlEnvironment } from '../../../config/initializeControlEnvironment';

describe('getLiveResourceDefinitionFromDatabase', () => {
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
  describe('table', () => {
    const resource = new ResourceDefinition({
      name: 'test_table_getResourceCreateStatement',
      type: ResourceType.TABLE,
      sql: 'CREATE TABLE test_table_getResourceCreateStatement ( id BIGINT )',
    });
    it('should throw an error if table is not defined', async () => {
      await connection.query({ sql: 'DROP TABLE IF EXISTS test_table_getResourceCreateStatement' }); // ensure possible previous state does not affect test
      try {
        await getLiveResourceDefinitionFromDatabase({
          connection,
          resourceName: resource.name,
          resourceType: resource.type,
        });
        throw new Error('should not reach here');
      } catch (error) {
        expect(error.constructor).toEqual(ResourceDoesNotExistError);
      }
    });
    it('should be able to get sql of an existing table', async () => {
      await connection.query({ sql: 'DROP TABLE IF EXISTS test_table_getResourceCreateStatement' }); // ensure possible previous state does not affect test

      // apply the resource
      await connection.query({ sql: resource.sql });

      // get status
      const liveResource = await getLiveResourceDefinitionFromDatabase({
        connection,
        resourceName: resource.name,
        resourceType: resource.type,
      });
      expect(liveResource.constructor).toEqual(ResourceDefinition);
      expect(liveResource).toMatchSnapshot(); // log example of the sql
    });
  });
  describe('function', () => {
    const resource = new ResourceDefinition({
      name: 'f_function_for_testing_getResourceCreateStatement',
      type: ResourceType.FUNCTION,
      sql: `
CREATE FUNCTION f_function_for_testing_getResourceCreateStatement(
  in_message TEXT
)
RETURNS BINARY(32)
BEGIN
RETURN UNHEX(SHA(in_message)); -- some comment
END;
      `,
    });
    it('should throw an error if function is not defined', async () => {
      await connection.query({ sql: 'DROP FUNCTION IF EXISTS f_function_for_testing_getResourceCreateStatement;' }); // ensure possible previous state does not affect test
      try {
        await await getLiveResourceDefinitionFromDatabase({
          connection,
          resourceName: resource.name,
          resourceType: resource.type,
        });
        throw new Error('should not reach here');
      } catch (error) {
        expect(error.constructor).toEqual(ResourceDoesNotExistError);
      }
    });
    it('should be able to get sql of an existing function', async () => {
      await connection.query({ sql: 'DROP FUNCTION IF EXISTS f_function_for_testing_getResourceCreateStatement;' }); // ensure possible previous state does not affect test

      // apply the resource
      await connection.query({ sql: resource.sql });

      // get status
      const liveResource = await getLiveResourceDefinitionFromDatabase({
        connection,
        resourceName: resource.name,
        resourceType: resource.type,
      });
      expect(liveResource.constructor).toEqual(ResourceDefinition);
      expect(liveResource).toMatchSnapshot(); // log example of the sql
    });
  });
  describe('procedure', () => {
    const resource = new ResourceDefinition({
      name: 'upsert_something_for_getResourceCreateStatement',
      type: ResourceType.PROCEDURE,
      sql: `
CREATE PROCEDURE upsert_something_for_getResourceCreateStatement(
  IN in_value TEXT
)
BEGIN
  SELECT true;
END;
      `,
    });
    it('should throw an error if procedure is not defined', async () => {
      await connection.query({ sql: 'DROP PROCEDURE IF EXISTS upsert_something_for_getResourceCreateStatement;' }); // ensure possible previous state does not affect test
      try {
        await getLiveResourceDefinitionFromDatabase({
          connection,
          resourceName: resource.name,
          resourceType: resource.type,
        });
        throw new Error('should not reach here');
      } catch (error) {
        expect(error.constructor).toEqual(ResourceDoesNotExistError);
      }
    });
    it('should be able to get sql of an existing procedure', async () => {
      await connection.query({ sql: 'DROP PROCEDURE IF EXISTS upsert_something_for_getResourceCreateStatement;' }); // ensure possible previous state does not affect test

      // apply the resource
      await connection.query({ sql: resource.sql });

      // get status
      const liveResource = await getLiveResourceDefinitionFromDatabase({
        connection,
        resourceName: resource.name,
        resourceType: resource.type,
      });
      expect(liveResource.constructor).toEqual(ResourceDefinition);
      expect(liveResource).toMatchSnapshot(); // log example of the sql
    });
  });
});
