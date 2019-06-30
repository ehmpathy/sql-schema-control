import { ChangeDefinition, DatabaseConnection, ResourceDefinition } from '../../../types';
import { getChangeStatus } from './getChangeStatus';
import { getResourceStatus } from './getResourceStatus';

export const getStatus = async ({ connection, definition }: {
  connection: DatabaseConnection,
  definition: ChangeDefinition | ResourceDefinition,
}) => {
  if (definition.constructor === ChangeDefinition) return getChangeStatus({ connection, change: definition as ChangeDefinition });
  if (definition.constructor === ResourceDefinition) return getResourceStatus({ connection, resource: definition as ResourceDefinition });
  throw new Error('unsupported controlled definition');
};
