import { DatabaseConnection, ResourceDefinition } from '../../../../types';
import { getSqlDifference } from '../../utils/getSqlDifference';
import { getLiveResourceDefinitionFromDatabase } from '../getLiveResourceDefinitionFromDatabase';
import { normalizeDDLToSupportLossyShowCreateStatements } from './normalizeDDLToSupportLossyShowCreateStatements/normalizeDDLToSupportLossyShowCreateStatements';
import { stripIrrelevantContentFromResourceDDL } from './stripIrrelevantContentFromResourceDDL/stripIrrelevantContentFromResourceDDL';

const stripAndNormalizeResourceDDL = ({ resource }: { resource: ResourceDefinition }) => {
  const stripedDdl = stripIrrelevantContentFromResourceDDL({ ddl: resource.sql, resourceType: resource.type });
  const normalizedDdl = normalizeDDLToSupportLossyShowCreateStatements({
    ddl: stripedDdl,
    resourceType: resource.type,
  });
  return normalizedDdl;
};

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
  const newSql = stripAndNormalizeResourceDDL({ resource });
  const oldSql = stripAndNormalizeResourceDDL({ resource: liveResource });
  const sqlDifference = getSqlDifference({
    // trim and add newline to standardize how diff calculates and displays
    oldSql: `${oldSql.trim()}\n`,
    newSql: `${newSql.trim()}\n`,
  });

  // 3. return the formatted difference
  return sqlDifference;
};
