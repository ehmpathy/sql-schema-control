import { ChangeDefinition, DefinitionType, DatabaseConnection } from '../../../types';
import { getChangeDifference } from './getChangeDifference';

/*
  resolves getting status per adapter based on definition.type
*/
const getDifferencePerDefinitionType = {
  [DefinitionType.CHANGE]: getChangeDifference,
};
export const getDifference = async ({ connection, definition }: { connection: DatabaseConnection, definition: ChangeDefinition }) => {
  // 1. check that we have an adaptor defined for this definition type
  if (!Object.keys(getDifferencePerDefinitionType).includes(definition.type)) throw new Error('definition type is not supported');

  // 2. apply the adaptor method, since supported
  return getDifferencePerDefinitionType[definition.type]({ connection, change: definition as ChangeDefinition });
};
