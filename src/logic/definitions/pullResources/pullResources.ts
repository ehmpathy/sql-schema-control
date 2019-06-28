import { ResourceType, ResourceDefinition, DatabaseConnection } from '../../../types';

/*
  1. check existance of all supported resource types
    - tables
    - functions
    - sprocs

  TODO: implement adaptor pattern to support other databases (e.g., postgres)
*/
export const pullResources = async ({ connection }: { connection: DatabaseConnection }) => {
  // 1. get table resource definitions
  const [showTableRows] = await connection.query({ sql: 'SHOW TABLES;' });
  const tableNames: string[] = showTableRows
    .map((result: any) => Object.values(result)[0]) // cast from form TextRow { Tables_in_superimportantdb: 'data_source' },
    .filter((tableName: string) => tableName !== 'schema_control_change_log');
  const tables = await Promise.all(tableNames.map(async (tableName) => {
    const result = await connection.query({ sql: `SHOW CREATE TABLE ${tableName}` });
    const resource = new ResourceDefinition({
      id: `table:${tableName}`,
      type: ResourceType.TABLE,
      sql: result[0][0]['Create Table'],
    });
    return resource;
  }));

  // 2. get function definitions
  const [showFunctionRows] = await connection.query({ sql: 'SHOW FUNCTION STATUS WHERE Db = DATABASE();' });
  const functionNames: string[] = showFunctionRows.map((result: any) => result.Name);
  const functions = await Promise.all(functionNames.map(async (functionName) => {
    const result = await connection.query({ sql: `SHOW CREATE FUNCTION ${functionName}` });
    const resource = new ResourceDefinition({
      id: `function:${functionName}`,
      type: ResourceType.FUNCTION,
      sql: result[0][0]['Create Function'],
    });
    return resource;
  }));

  // 3. get function definitions
  const [showProcedureRows] = await connection.query({ sql: 'SHOW PROCEDURE STATUS WHERE Db = DATABASE();' });
  const procedureNames: string[] = showProcedureRows.map((result: any) => result.Name);
  const procedures = await Promise.all(procedureNames.map(async (procedureName) => {
    const result = await connection.query({ sql: `SHOW CREATE PROCEDURE ${procedureName}` });
    const resource = new ResourceDefinition({
      id: `procedure:${procedureName}`,
      type: ResourceType.PROCEDURE,
      sql: result[0][0]['Create Procedure'],
    });
    return resource;
  }));

  // 3. return all merged
  return [...tables, ...functions, ...procedures];
};
