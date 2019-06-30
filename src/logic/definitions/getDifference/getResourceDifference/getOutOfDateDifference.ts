import { DatabaseConnection, ResourceDefinition, ResourceDefinitionStatus } from '../../../../types';
import { getSqlDifference } from '../_utils/getSqlDifference';
import { getResourceFromDatabase } from '../../_utils/getResourceFromDatabase';

/*
for the definition:
  - throw error if status is not "out of date"
  - return difference object if status is "out of date"
*/
export const getOutOfDateDifference = async ({ connection, resource }: { connection: DatabaseConnection, resource: ResourceDefinition }) => {
  // 0. throw an error if change status is not OUT_OF_DATE
  if (resource.status !== ResourceDefinitionStatus.OUT_OF_SYNC) throw new Error(`change.status must be ${ResourceDefinitionStatus.OUT_OF_SYNC} to get diff`);

  // 1. get state of change in db
  const liveResource = await getResourceFromDatabase({
    connection,
    resourceName: resource.name,
    resourceType: resource.type,
  });

  // 2. cast into string
  const sqlDiffString = getSqlDifference({ // trim and add newline to standardize how ediff calculates and displays
    oldSql: `${liveResource.sql.trim()}\n`,
    newSql: `${resource.sql.trim()}\n`,
  });

  // 3. return the diff string
  return sqlDiffString;
};
