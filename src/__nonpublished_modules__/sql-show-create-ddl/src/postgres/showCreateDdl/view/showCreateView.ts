import { DatabaseConnection } from '../../../types';

export const showCreateView = async ({
  dbConnection,
  schema,
  name,
}: {
  dbConnection: DatabaseConnection;
  schema: string;
  name: string;
}) => {
  const result = await dbConnection.query({
    sql: `
SELECT 'CREATE OR REPLACE VIEW ${name} AS ' || E'\n' || ' ' || pg_get_viewdef(c.oid) as ddl
FROM pg_catalog.pg_class c
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE 1=1
  AND c.relkind = 'v' -- v = view; https://www.postgresql.org/docs/9.3/catalog-pg-class.html
  AND n.nspname = $1 -- the schema
  AND c.relname = $2; -- the view name
    `.trim(),
    values: [schema, name],
  });
  if (!result.rows) throw new Error(`could not find view '${schema}.${name}'`);
  return result.rows[0].ddl;
};
