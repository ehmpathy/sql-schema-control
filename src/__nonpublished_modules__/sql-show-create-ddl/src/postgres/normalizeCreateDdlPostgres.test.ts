import { normalizeCreateDdlPostgres } from './normalizeCreateDdlPostgres';
import { ResourceType } from '../../../../types';

describe('normalizeCreateDdlPostgres', () => {
  it('should remove the schema qualifier if the qualifier is for the expected schema', () => {
    const exampleDdl = `
CREATE TABLE superimportantdb.some_resource_table (
  id bigserial NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT some_resource_table_pk PRIMARY KEY (id)
);
CREATE INDEX some_resource_table_ix ON superimportantdb.job_cvp USING btree (job_version_id);
"
    `.trim();
    const normalizedDdl = normalizeCreateDdlPostgres({
      schema: 'superimportantdb',
      type: ResourceType.TABLE,
      ddl: exampleDdl,
    });
    expect(normalizedDdl).not.toContain('superimportantdb.');
  });
});
