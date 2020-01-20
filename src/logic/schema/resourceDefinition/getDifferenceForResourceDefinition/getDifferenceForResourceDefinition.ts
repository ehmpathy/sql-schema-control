import { getLiveResourceDefinitionFromDatabase } from '../getLiveResourceDefinitionFromDatabase';
import { DatabaseConnection, ResourceDefinition } from '../../../../types';
import { getSqlDifference } from '../../utils/getSqlDifference';

export const getDifferenceForResourceDefinition = async ({
  connection,
  resource,
}: {
  connection: DatabaseConnection;
  resource: ResourceDefinition;
}): Promise<string | null> => {
  // 1. get state of change in db
  const liveResource = await getLiveResourceDefinitionFromDatabase({
    connection,
    resourceName: resource.name,
    resourceType: resource.type,
  });

  // 2. cast into string
  const sqlDifference = getSqlDifference({
    // trim and add newline to standardize how diff calculates and displays
    oldSql: `${liveResource.sql.trim()}\n`,
    newSql: `${resource.sql.trim()}\n`,
  });

  // 3. return the formatted difference
  return sqlDifference;
};
