import { ChangeDefinition, DefinitionType, DatabaseConnection } from '../../../types';
import { getChangeStatus } from './getChangeStatus';

/*
  resolves getting status per adapter based on definition.type
*/
const getStatusPerDefinitionType = {
  [DefinitionType.CHANGE]: getChangeStatus,
};
export const getStatus = async ({ connection, definition }: { connection: DatabaseConnection, definition: ChangeDefinition }) => {
  // 1. check that we have an adaptor defined for this definition type
  if (!Object.keys(getStatusPerDefinitionType).includes(definition.type)) throw new Error('definition type is not supported');

  // 2. apply the adaptor method, since supported
  return getStatusPerDefinitionType[definition.type]({ connection, change: definition as ChangeDefinition });
};
