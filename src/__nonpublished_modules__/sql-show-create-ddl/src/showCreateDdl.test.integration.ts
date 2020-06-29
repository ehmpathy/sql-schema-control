import { DatabaseLanguage, ResourceType } from '../../../types';
import { getDbConnection } from './__test_assets__/getDbConnection';
import { DatabaseConnection } from './types';
import { showCreateDdl } from './showCreateDdl';

/**
 * this test suite simply proves that we can fetch the create ddl for each resource
 *
 * testing normalization and accuracy of these statements should be done in the individual functions, per ${DatabaseLanguage}.${ResourceType}
 */
describe('showCreateDdl', () => {
  describe('mysql', () => {
    let dbConnection: DatabaseConnection;
    beforeAll(async () => {
      dbConnection = await getDbConnection({ language: DatabaseLanguage.MYSQL });
    });
    afterAll(async () => {
      await dbConnection.end();
    });
    it('should be able to get create ddl for a table', async () => {
      await dbConnection.query({ sql: 'DROP TABLE IF EXISTS test_table_for_showcreate' }); // ensure possible previous state does not affect test
      await dbConnection.query({ sql: 'CREATE TABLE test_table_for_showcreate ( id BIGINT )' });
      const ddl = await showCreateDdl({
        dbConnection,
        language: DatabaseLanguage.MYSQL,
        type: ResourceType.TABLE,
        schema: 'superimportantdb',
        name: 'test_table_for_showcreate',
      });
      expect(ddl).toContain('CREATE TABLE');
      expect(ddl).toContain('test_table_for_showcreate');
      expect(ddl).toMatchSnapshot(); // just to print an example
    });
    it('should be able to get create ddl for a view', async () => {
      await dbConnection.query({ sql: 'DROP VIEW IF EXISTS test_view_for_showcreate' }); // ensure possible previous state does not affect test
      await dbConnection.query({ sql: "CREATE VIEW test_view_for_showcreate as SELECT 'hello' as first_words" });
      const ddl = await showCreateDdl({
        dbConnection,
        language: DatabaseLanguage.MYSQL,
        type: ResourceType.VIEW,
        schema: 'superimportantdb',
        name: 'test_view_for_showcreate',
      });
      expect(ddl).toContain('CREATE VIEW');
      expect(ddl).toContain('test_view_for_showcreate');
      expect(ddl).toMatchSnapshot(); // just to print an example
    });
    it('should be able to get create ddl for a function', async () => {
      await dbConnection.query({ sql: 'DROP FUNCTION IF EXISTS f_some_function_for_testing_showcreate;' }); // ensure possible previous state does not affect test
      await dbConnection.query({
        sql: `
CREATE FUNCTION f_some_function_for_testing_showcreate(
  in_message TEXT
)
RETURNS BINARY(32)
BEGIN
  RETURN UNHEX(SHA(in_message)); -- some comment
END;
       `,
      });
      const ddl = await showCreateDdl({
        dbConnection,
        language: DatabaseLanguage.MYSQL,
        type: ResourceType.FUNCTION,
        schema: 'superimportantdb',
        name: 'f_some_function_for_testing_showcreate',
      });
      expect(ddl).toContain('CREATE FUNCTION');
      expect(ddl).toContain('f_some_function_for_testing_showcreate');
      expect(ddl).toMatchSnapshot(); // just to print an example
    });
    it('should be able to get create ddl for a procedure', async () => {
      await dbConnection.query({ sql: 'DROP PROCEDURE IF EXISTS f_some_procedure_for_testing_showcreate;' }); // ensure possible previous state does not affect test
      await dbConnection.query({
        sql: `
CREATE PROCEDURE f_some_procedure_for_testing_showcreate(
  IN in_message TEXT
)
BEGIN
  SELECT UNHEX(SHA(in_message)); -- some comment
END;
       `,
      });
      const ddl = await showCreateDdl({
        dbConnection,
        language: DatabaseLanguage.MYSQL,
        type: ResourceType.PROCEDURE,
        schema: 'superimportantdb',
        name: 'f_some_procedure_for_testing_showcreate',
      });
      expect(ddl).toContain('CREATE PROCEDURE');
      expect(ddl).toContain('f_some_procedure_for_testing_showcreate');
      expect(ddl).toMatchSnapshot(); // just to print an example
    });
  });
  describe('postgres', () => {
    let dbConnection: DatabaseConnection;
    beforeAll(async () => {
      dbConnection = await getDbConnection({ language: DatabaseLanguage.POSTGRES });
    });
    afterAll(async () => {
      await dbConnection.end();
    });
    it('should be able to get create ddl for a table', async () => {
      await dbConnection.query({ sql: 'DROP TABLE IF EXISTS test_table_for_showcreate' }); // ensure possible previous state does not affect test
      await dbConnection.query({ sql: 'CREATE TABLE test_table_for_showcreate ( id BIGINT )' });
      const ddl = await showCreateDdl({
        dbConnection,
        language: DatabaseLanguage.POSTGRES,
        type: ResourceType.TABLE,
        schema: 'public',
        name: 'test_table_for_showcreate',
      });
      expect(ddl).toContain('CREATE TABLE');
      expect(ddl).toContain('test_table_for_showcreate');
      expect(ddl).toMatchSnapshot(); // just to print an example
    });
    it('should be able to get create ddl for a view', async () => {
      await dbConnection.query({ sql: 'DROP VIEW IF EXISTS test_view_for_showcreate' }); // ensure possible previous state does not affect test
      await dbConnection.query({ sql: "CREATE VIEW test_view_for_showcreate as SELECT 'hello' as first_words" });
      const ddl = await showCreateDdl({
        dbConnection,
        language: DatabaseLanguage.POSTGRES,
        type: ResourceType.VIEW,
        schema: 'public',
        name: 'test_view_for_showcreate',
      });
      expect(ddl).toContain('CREATE OR REPLACE VIEW');
      expect(ddl).toContain('test_view_for_showcreate');
      expect(ddl).toMatchSnapshot(); // just to print an example
    });
    it('should be able to get create ddl for a function', async () => {
      await dbConnection.query({ sql: 'DROP FUNCTION IF EXISTS f_some_function_for_testing_showcreate;' }); // ensure possible previous state does not affect test
      await dbConnection.query({
        sql: `
CREATE FUNCTION f_some_function_for_testing_showcreate(
  in_message TEXT
)
RETURNS text
LANGUAGE plpgsql
AS $$
  BEGIN
    RETURN 'modified' || in_message; -- some comment
  END;
$$
       `,
      });
      const ddl = await showCreateDdl({
        dbConnection,
        language: DatabaseLanguage.POSTGRES,
        type: ResourceType.FUNCTION,
        schema: 'public',
        name: 'f_some_function_for_testing_showcreate',
      });
      expect(ddl).toContain('CREATE OR REPLACE FUNCTION');
      expect(ddl).toContain('f_some_function_for_testing_showcreate');
      expect(ddl).toMatchSnapshot(); // just to print an example
    });
    it.skip('should be able to get create ddl for a procedure', async () => {
      // TODO: support procedures, which were released in postgres v11; https://www.postgresql.org/docs/11/sql-createprocedure.html
    });
  });
});
