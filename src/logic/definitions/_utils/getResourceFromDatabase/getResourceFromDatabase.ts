// TODO: use this in pull resources too. make it a util

import { DatabaseConnection, ResourceType, ResourceDefinition } from '../../../../types';

export class ResourceDoesNotExistError extends Error {
  public resourceType: ResourceType;
  public resourceName: string;
  constructor({ resourceType, resourceName }: { resourceType: ResourceType, resourceName: string }) {
    super(`resource ${resourceType}:${resourceName} does not exist`);
    this.resourceType = resourceType;
    this.resourceName = resourceName;
  }
}
const resourceToTitleCase = {
  [ResourceType.TABLE]: 'Table',
  [ResourceType.FUNCTION]: 'Function',
  [ResourceType.PROCEDURE]: 'Procedure',
};
export const getResourceFromDatabase = async ({ connection, resourceType, resourceName }: {
  connection: DatabaseConnection,
  resourceType: ResourceType,
  resourceName: string,
}) => {
  try {
    const result = await connection.query({ sql: `SHOW CREATE ${resourceType} ${resourceName}` });
    const liveCreateSql = result[0][0][`Create ${resourceToTitleCase[resourceType]}`];
    return new ResourceDefinition({
      name: resourceName,
      type: resourceType,
      sql: liveCreateSql,
    });
  } catch (error) {
    if (!error.message.includes('doesn\'t exist') && !error.message.includes('does not exist')) throw error; // if the error did not say "doesn't exist" - its an unexpected error
    throw new ResourceDoesNotExistError({ resourceType, resourceName });
  }
};
