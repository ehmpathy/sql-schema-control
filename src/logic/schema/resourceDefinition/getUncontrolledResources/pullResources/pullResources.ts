import { type DatabaseConnection, ResourceType } from '../../../../../domain';
import { getLiveResourceDefinitionFromDatabase } from '../../getLiveResourceDefinitionFromDatabase';

/*
  1. check existence of all supported resource types
    - tables
    - views
    - functions
    - sprocs
*/
export const pullResources = async ({
  connection,
}: {
  connection: DatabaseConnection;
}) => {
  // 1. get table resource definitions
  // select TABLE_NAME as Name, UPDATE_TIME as Update_time from information_schema.tables where TABLE_SCHEMA='my_database_name'
  const { rows: showTableRows } = await connection.query({
    sql: `select table_name from information_schema.tables where table_schema = '${connection.schema}' and table_type='BASE TABLE'`,
  });
  const tableNames: string[] = showTableRows
    .map((result) => result.table_name)
    .filter((tableName: string) => tableName !== 'schema_control_change_log'); // since we provision this one internally
  const tables = await Promise.all(
    tableNames.map((tableName) =>
      getLiveResourceDefinitionFromDatabase({
        connection,
        resourceType: ResourceType.TABLE,
        resourceName: tableName,
      }),
    ),
  );

  // 2. get table resource definitions
  const { rows: showViewRows } = await connection.query({
    sql: `select table_name as view_name from information_schema.views where table_schema = '${connection.schema}'`,
  });
  const viewNames: string[] = showViewRows.map(
    (result: any) => result.view_name,
  );
  const views = await Promise.all(
    viewNames.map((viewName) =>
      getLiveResourceDefinitionFromDatabase({
        connection,
        resourceType: ResourceType.VIEW,
        resourceName: viewName,
      }),
    ),
  );

  // 2. get function definitions
  const { rows: showFunctionRows } = await connection.query({
    sql: `select routine_name from information_schema.routines where routine_type = 'FUNCTION' and routine_schema = '${connection.schema}'`,
  });
  const functionNames: string[] = showFunctionRows.map(
    (result: any) => result.routine_name,
  );
  const functions = await Promise.all(
    functionNames.map((functionName) =>
      getLiveResourceDefinitionFromDatabase({
        connection,
        resourceType: ResourceType.FUNCTION,
        resourceName: functionName,
      }),
    ),
  );

  // 3. get procedure definitions
  const { rows: showProcedureRows } = await connection.query({
    sql: `select routine_name from information_schema.routines where routine_type = 'PROCEDURE' and routine_schema = '${connection.schema}'`,
  });
  const procedureNames: string[] = showProcedureRows.map(
    (result: any) => result.routine_name,
  );
  const procedures = await Promise.all(
    procedureNames.map((procedureName) =>
      getLiveResourceDefinitionFromDatabase({
        connection,
        resourceType: ResourceType.PROCEDURE,
        resourceName: procedureName,
      }),
    ),
  );

  // 3. return all merged
  return [...tables, ...views, ...functions, ...procedures];
};
