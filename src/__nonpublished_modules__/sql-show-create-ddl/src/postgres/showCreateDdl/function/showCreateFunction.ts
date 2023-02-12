import { DatabaseConnection } from '../../../types';

export const showCreateFunction = async ({
  dbConnection,
  schema,
  func,
}: {
  dbConnection: DatabaseConnection;
  schema: string;
  func: string;
}) => {
  const result = await dbConnection.query({
    sql: `
SELECT pg_get_functiondef(p.oid) as ddl
FROM pg_proc p
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE 1=1
  AND n.nspname = $1
  AND p.proname = $2;
      `.trim(),
    values: [schema, func],
  });
  if (!result.rows.length)
    throw new Error(`could not find function '${schema}.${func}'`);
  return result.rows[0].ddl as string;
};
