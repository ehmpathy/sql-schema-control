// TODO: use this in pull resources too. make it a util
import { showCreateDdl } from '@src/_topublish/sql-show-create-ddl';
import {
  type DatabaseConnection,
  ResourceDefinition,
  type ResourceType,
} from '@src/domain';

export const getLiveResourceDefinitionFromDatabase = async ({
  connection,
  resourceType,
  resourceName,
}: {
  connection: DatabaseConnection;
  resourceType: ResourceType;
  resourceName: string;
}) => {
  const liveCreateDdl = await showCreateDdl({
    dbConnection: connection,
    language: connection.language,
    schema: connection.schema,
    name: resourceName,
    type: resourceType,
  });
  return new ResourceDefinition({
    name: resourceName,
    type: resourceType,
    sql: liveCreateDdl,
  });
};
