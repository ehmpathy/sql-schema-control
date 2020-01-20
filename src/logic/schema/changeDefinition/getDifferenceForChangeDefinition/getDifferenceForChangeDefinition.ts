import { DatabaseConnection, ChangeDefinition } from '../../../../types';
import { getSqlDifference } from '../../utils/getSqlDifference';
import { getAppliedChangeDefinitionFromDatabase } from '../getAppliedChangeDefinitionFromDatabase/getAppliedChangeDefinitionFromDatabase';

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
  const sqlDifference = getSqlDifference({ oldSql: lastAppliedChange.sql, newSql: change.sql });

  // 3. return the diff string
  return sqlDifference;
};
