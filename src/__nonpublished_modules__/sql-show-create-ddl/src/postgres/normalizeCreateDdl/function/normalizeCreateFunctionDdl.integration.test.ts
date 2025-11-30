import { DatabaseLanguage } from '../../../../../../domain';
import { getDbConnection } from '../../../.test/assets/getDbConnection';
import type { DatabaseConnection } from '../../../types';
import { showCreateFunction } from '../../showCreateDdl/function/showCreateFunction';
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
