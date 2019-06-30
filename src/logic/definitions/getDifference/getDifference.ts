import { ChangeDefinition, ResourceDefinition, DatabaseConnection } from '../../../types';
import { getChangeDifference } from './getChangeDifference';
import { getResourceDifference } from './getResourceDifference';

/*
  resolves getting status per adapter based on definition.type
*/
export const getDifference = async ({ connection, definition }: { connection: DatabaseConnection, definition: ChangeDefinition | ResourceDefinition }) => {
  if (definition.constructor === ChangeDefinition) return getChangeDifference({ connection, change: definition as ChangeDefinition });
  if (definition.constructor === ResourceDefinition) return getResourceDifference({ connection, resource: definition as ResourceDefinition });
  throw new Error('definition type is not supported');
};
