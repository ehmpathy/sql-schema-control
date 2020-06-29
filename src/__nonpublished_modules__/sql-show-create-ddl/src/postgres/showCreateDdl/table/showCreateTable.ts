import { DatabaseConnection } from '../../../types';
import { provisionShowCreateTableFunction } from './provisionShowCreateTableFunction';

export const showCreateTable = async ({
  dbConnection,
  schema,
  table,
}: {
  dbConnection: DatabaseConnection;
  schema: string;
  table: string;
}) => {
  // provision the show create function if it dne (since nothing like this comes standard w/ postgres)
  const { rows } = await dbConnection.query({
    sql: "select * from information_schema.routines where routine_name = 'show_create_table' ",
  });
  if (!rows.length) {
    // since dne, provision it
    await provisionShowCreateTableFunction({ dbConnection });
  }

  // grab the ddl our function generates
  const result = await dbConnection.query({
    sql: 'SELECT public.show_create_table($1, $2) as ddl',
    values: [schema, table],
  });
  if (!result.rows) throw new Error(`could not find table '${schema}.${table}'`);
  return result.rows[0].ddl;
};
