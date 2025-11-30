import { normalizeShowCreateDdl } from '../../../../__nonpublished_modules__/sql-show-create-ddl';
import type {
  DatabaseConnection,
  ResourceDefinition,
} from '../../../../domain';
import { getSqlDifference } from '../../utils/getSqlDifference';
import { getLiveResourceDefinitionFromDatabase } from '../getLiveResourceDefinitionFromDatabase';

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
  const newSql = await normalizeShowCreateDdl({
    schema: connection.schema,
    language: connection.language,
    type: resource.type,
    ddl: resource.sql,
  });
  const oldSql = await normalizeShowCreateDdl({
    schema: connection.schema,
    language: connection.language,
    type: liveResource.type,
    ddl: liveResource.sql,
  });
  const sqlDifference = getSqlDifference({
    // trim and add newline to standardize how diff calculates and displays
    oldSql: `${oldSql.trim()}\n`,
    newSql: `${newSql.trim()}\n`,
  });

  // 3. return the formatted difference
  return sqlDifference;
};
