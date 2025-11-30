import { DatabaseLanguage } from '../../../../../../domain';
import { getDbConnection } from '../../../.test/assets/getDbConnection';
import type { DatabaseConnection } from '../../../types';
import { provisionShowCreateTableFunction } from '../../showCreateDdl/table/provisionShowCreateTableFunction';
import { showCreateTable } from '../../showCreateDdl/table/showCreateTable';
import { normalizeCreateTableDdl } from './normalizeCreateTableDdl';

describe('showCreateTable', () => {
  let dbConnection: DatabaseConnection;
  beforeAll(async () => {
    dbConnection = await getDbConnection({
      language: DatabaseLanguage.POSTGRES,
    });
  });
  afterAll(async () => {
    await dbConnection.end();
  });
  it('should be possible to get create statement of table', async () => {
    await provisionShowCreateTableFunction({ dbConnection });
    await dbConnection.query({
      sql: 'DROP TABLE IF EXISTS test_tb_for_show_create_on;',
    });
    await dbConnection.query({
      sql: `
CREATE TABLE test_tb_for_show_create_on (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150),
  level VARCHAR(50) CHECK (level IN ('info', 'warn', 'error')) DEFAULT 'info',
  description TEXT NOT NULL
)
    `.trim(),
    });
    const ddl = await showCreateTable({
      dbConnection,
      schema: 'public',
      table: 'test_tb_for_show_create_on',
    });
    const normalizedDdl = await normalizeCreateTableDdl({ ddl });
    expect(normalizedDdl).toMatchSnapshot();
  });
});
