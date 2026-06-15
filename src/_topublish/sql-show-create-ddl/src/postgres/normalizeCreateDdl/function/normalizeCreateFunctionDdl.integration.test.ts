import { getDbConnection } from '@src/_topublish/sql-show-create-ddl/src/.test/assets/getDbConnection';
import { showCreateFunction } from '@src/_topublish/sql-show-create-ddl/src/postgres/showCreateDdl/function/showCreateFunction';
import type { DatabaseConnection } from '@src/_topublish/sql-show-create-ddl/src/types';
import { DatabaseLanguage } from '@src/domain';

import { normalizeCreateFunctionDdl } from './normalizeCreateFunctionDdl';

describe('normalizeCreateFunctionDdl', () => {
  let dbConnection: DatabaseConnection;
  beforeAll(async () => {
    dbConnection = await getDbConnection({
      language: DatabaseLanguage.POSTGRES,
    });
  });
  afterAll(async () => {
    await dbConnection.end();
  });
  it('should be possible to get create statement of function', async () => {
    await dbConnection.query({
      sql: 'DROP FUNCTION IF EXISTS test_func_for_show_create_on;',
    });
    await dbConnection.query({
      sql: `
CREATE FUNCTION test_func_for_show_create_on (
  in_name varchar,
  in_date timestamptz,
  in_counter int
)
RETURNS int
LANGUAGE plpgsql VOLATILE
AS
$$
  DECLARE
    v_test_int int := 821;
  BEGIN
    RETURN v_test_int;
  END;
$$
      `.trim(),
    });
    const ddl = await showCreateFunction({
      dbConnection,
      schema: 'public',
      func: 'test_func_for_show_create_on',
    });
    const normalizedDdl = normalizeCreateFunctionDdl({ ddl });
    expect(normalizedDdl).toMatchSnapshot();
  });
});
