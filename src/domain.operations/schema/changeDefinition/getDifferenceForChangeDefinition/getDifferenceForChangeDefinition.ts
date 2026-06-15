import type { ChangeDefinition, DatabaseConnection } from '@src/domain';
import { getAppliedChangeDefinitionFromDatabase } from '@src/domain.operations/schema/changeDefinition/getAppliedChangeDefinitionFromDatabase/getAppliedChangeDefinitionFromDatabase';
import { getSqlDifference } from '@src/domain.operations/schema/utils/getSqlDifference';

export const getDifferenceForChangeDefinition = async ({
  connection,
  change,
}: {
  connection: DatabaseConnection;
  change: ChangeDefinition;
}) => {
  // 1. get state of change in db
  const lastAppliedChange = await getAppliedChangeDefinitionFromDatabase({
    connection,
    changeId: change.id,
    changePath: change.path,
  });

  // 2. cast into string
  const sqlDifference = getSqlDifference({
    oldSql: lastAppliedChange.sql,
    newSql: change.sql,
  });

  // 3. return the diff string
  return sqlDifference;
};
