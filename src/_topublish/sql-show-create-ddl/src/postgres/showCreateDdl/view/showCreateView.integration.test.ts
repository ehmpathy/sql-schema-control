import { getDbConnection } from '@src/_topublish/sql-show-create-ddl/src/.test/assets/getDbConnection';
import type { DatabaseConnection } from '@src/_topublish/sql-show-create-ddl/src/types';
import { DatabaseLanguage } from '@src/domain';

import { showCreateView } from './showCreateView';

describe('showCreateView', () => {
  let dbConnection: DatabaseConnection;
  beforeAll(async () => {
    dbConnection = await getDbConnection({
      language: DatabaseLanguage.POSTGRES,
    });
  });
  afterAll(async () => {
    await dbConnection.end();
  });
  it('should be possible to get create statement of view', async () => {
    await dbConnection.query({
      sql: 'DROP VIEW IF EXISTS test_view_for_show_create_on;',
    });
    await dbConnection.query({
      sql: "CREATE VIEW test_view_for_show_create_on as SELECT 'hello' as first_words",
    });
    const result = await showCreateView({
      dbConnection,
      schema: 'public',
      name: 'test_view_for_show_create_on',
    });
    expect(result).toContain('CREATE OR REPLACE VIEW');
    expect(result).toMatchSnapshot();
  });
});
