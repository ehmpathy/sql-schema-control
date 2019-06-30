import { DatabaseConnection, ChangeDefinition, ChangeDefinitionStatus } from '../../../../types';
import { getSqlDifference } from '../_utils/getSqlDifference';

/*
for the definition:
  - throw error if status is not "out of date"
  - return difference object if status is "out of date"
*/
export const getOutOfDateDifference = async ({ connection, change }: { connection: DatabaseConnection, change: ChangeDefinition }) => {
  // 0. throw an error if change status is not OUT_OF_DATE
  if (change.status !== ChangeDefinitionStatus.OUT_OF_DATE) throw new Error(`change.status must be ${ChangeDefinitionStatus.OUT_OF_DATE} to get diff`);

  // 1. get state of change in db
  const [[result]] = await connection.query({
    sql: `select * from schema_control_change_log where change_id = '${change.id}'`,
  });

  // 2. cast into string
  const sqlDiffString = getSqlDifference({ oldSql: result.change_content, newSql: change.sql });

  // 3. return the diff string
  return sqlDiffString;
};
