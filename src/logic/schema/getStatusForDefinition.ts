import { DatabaseConnection, ChangeDefinition, ResourceDefinition } from '../../types';
import { getStatusForChangeDefinition } from './changeDefinition/getStatusForChangeDefinition';
import { getStatusForResourceDefinition } from './resourceDefinition/getStatusForResourceDefinition';

export const getStatusForDefinition = async ({
  connection,
  definition,
}: {
  connection: DatabaseConnection;
  definition: ChangeDefinition | ResourceDefinition;
}) => {
  // if definition already has status, do nothing (e.g., uncontrolled resources are found w/ status already)
  if (definition.status) return definition;

  // otherwise, find the status
  if (definition instanceof ChangeDefinition) {
    const status = await getStatusForChangeDefinition({ connection, change: definition });
    return new ChangeDefinition({ ...definition, status });
  }
  if (definition instanceof ResourceDefinition) {
    const status = await getStatusForResourceDefinition({ connection, resource: definition });
    return new ResourceDefinition({ ...definition, status });
  }
  throw new Error('unsupported controlled definition. this is an internal schema-generator error');
};
