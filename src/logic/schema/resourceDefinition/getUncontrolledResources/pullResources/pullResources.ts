import { ResourceType, DatabaseConnection } from '../../../../../types';
import { getLiveResourceDefinitionFromDatabase } from '../../getLiveResourceDefinitionFromDatabase';

/*
  1. check existence of all supported resource types
    - tables
    - functions
    - sprocs
*/
export const pullResources = async ({ connection }: { connection: DatabaseConnection }) => {
  // 1. get table resource definitions
  const [showTableRows] = await connection.query({ sql: "SHOW FULL TABLES WHERE Table_Type != 'VIEW';" });
  const tableNames: string[] = showTableRows
    .map((result: any) => Object.values(result)[0]) // cast from form TextRow { Tables_in_superimportantdb: 'data_source' },
    .filter((tableName: string) => tableName !== 'schema_control_change_log');
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
  const [showViewRows] = await connection.query({ sql: "SHOW FULL TABLES WHERE Table_Type = 'VIEW';" });
  const viewNames: string[] = showViewRows.map((result: any) => Object.values(result)[0]); // cast from form TextRow { Tables_in_superimportantdb: 'data_source' },
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
  const [showFunctionRows] = await connection.query({ sql: 'SHOW FUNCTION STATUS WHERE Db = DATABASE();' });
  const functionNames: string[] = showFunctionRows.map((result: any) => result.Name);
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
  const [showProcedureRows] = await connection.query({ sql: 'SHOW PROCEDURE STATUS WHERE Db = DATABASE();' });
  const procedureNames: string[] = showProcedureRows.map((result: any) => result.Name);
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
