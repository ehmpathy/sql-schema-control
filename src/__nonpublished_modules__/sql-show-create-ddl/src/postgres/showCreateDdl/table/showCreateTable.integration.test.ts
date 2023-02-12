import { DatabaseLanguage } from '../../../../../../types';
import { getDbConnection } from '../../../__test_assets__/getDbConnection';
import { DatabaseConnection } from '../../../types';
import { provisionShowCreateTableFunction } from './provisionShowCreateTableFunction';
import { showCreateTable } from './showCreateTable';

describe('showCreateTable', () => {
  let dbConnection: DatabaseConnection;
  beforeAll(async () => {
    dbConnection = await getDbConnection({ language: DatabaseLanguage.POSTGRES });
  });
  afterAll(async () => {
    await dbConnection.end();
  });
  it('should be possible to get create statement of table', async () => {
    await provisionShowCreateTableFunction({ dbConnection });
    await dbConnection.query({ sql: 'DROP TABLE IF EXISTS test_table_for_showcreate_on;' });
    await dbConnection.query({
      sql: `
CREATE TABLE test_table_for_showcreate_on (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150),
  level VARCHAR(50) CHECK (level IN ('info', 'warn', 'error'))
)
    `.trim(),
    });
    const result = await showCreateTable({ dbConnection, schema: 'public', table: 'test_table_for_showcreate_on' });
    expect(result).toMatchSnapshot();
  });
});
