import { normalizeShowCreateDdl } from '@src/_topublish/sql-show-create-ddl';
import type { DatabaseConnection, ResourceDefinition } from '@src/domain';
import { getLiveResourceDefinitionFromDatabase } from '@src/domain.operations/schema/resourceDefinition/getLiveResourceDefinitionFromDatabase';
import { getSqlDifference } from '@src/domain.operations/schema/utils/getSqlDifference';

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
