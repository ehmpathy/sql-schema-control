import { DatabaseLanguage } from '../../../../../../domain';
import { getDbConnection } from '../../../__test_assets__/getDbConnection';
import { DatabaseConnection } from '../../../types';
import { provisionShowCreateTableFunction } from '../../showCreateDdl/table/provisionShowCreateTableFunction';
import { showCreateView } from '../../showCreateDdl/view/showCreateView';
import { provisionDependencyTablesForMoreComplexView } from './__test_assets__/provisionDependencyTablesForMoreComplexView';
import { normalizeCreateViewDdl } from './normalizeCreateViewDdl';

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
  it('should be possible to normalize create view ddl', async () => {
    await provisionShowCreateTableFunction({ dbConnection });
    await dbConnection.query({
      sql: 'DROP VIEW IF EXISTS test_view_for_normalization_on;',
    });
    await dbConnection.query({
      sql: "CREATE VIEW test_view_for_normalization_on as SELECT 'hello' as first_words",
    });
    const ddl = await showCreateView({
      dbConnection,
      schema: 'public',
      name: 'test_view_for_normalization_on',
    });
    const normalizedDdl = await normalizeCreateViewDdl({ ddl });
    expect(normalizedDdl).toMatchSnapshot();
  });
  it('should normalize a more complex create view ddl cleanly', async () => {
    await dbConnection.query({ sql: 'DROP VIEW IF EXISTS view_home_current;' });
    await provisionDependencyTablesForMoreComplexView({ dbConnection });
    const complexViewDdl = `
CREATE OR REPLACE VIEW view_home_current AS
SELECT
  s.id,
  s.uuid,
  s.name,
  (
    SELECT array_agg(home_to_host.host_id ORDER BY home_to_host.array_order_index) as array_agg
    FROM home_to_host WHERE home_to_host.home_id = s.id
  ) as host_ids,
  s.built,
  s.bedrooms,
  s.bathrooms,
  (
    SELECT array_agg(home_version_to_photo.photo_id ORDER BY home_version_to_photo.array_order_index) as array_agg
    FROM home_version_to_photo WHERE home_version_to_photo.home_version_id = v.id
  ) as photo_ids,
  s.created_at,
  v.effective_at,
  v.created_at as updated_at
FROM home s
JOIN home_cvp cvp ON s.id = cvp.home_id
JOIN home_version v ON v.id = cvp.home_version_id;
    `.trim();
    await dbConnection.query({
      sql: complexViewDdl,
    });
    const ddl = await showCreateView({
      dbConnection,
      schema: 'public',
      name: 'view_home_current',
    });
    const normalizedDdl = await normalizeCreateViewDdl({ ddl });
    expect(normalizedDdl).toMatchSnapshot();

    // and it should normalize a reasonable definition of the view and the show create in the same way, since they are the same fundamentally
    const normalizedSourceDdl = normalizeCreateViewDdl({ ddl: complexViewDdl });
    expect(normalizedDdl).toEqual(normalizedSourceDdl); // should be equivalent, since they both describe the same view - and the source ddl is a reasonable expression of it
  });
});
