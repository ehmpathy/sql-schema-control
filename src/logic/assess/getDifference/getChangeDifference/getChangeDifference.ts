import { DatabaseConnection, ChangeDefinition, ChangeDefinitionStatus } from '../../../../types';
import { getOutOfDateDifference } from './getOutOfDateDifference';
import { getNotAppliedDifference } from './getNotAppliedDifference';

/*
for the definition:
  - per status, return difference
*/
export const getChangeDifference = async ({ connection, change }: { connection: DatabaseConnection, change: ChangeDefinition }): Promise<string | null> => {
  if (!change.status) throw new Error('status must be defined to determine difference');
  const getDifferenceMethods = {
    [ChangeDefinitionStatus.UP_TO_DATE]: async () => null,
    [ChangeDefinitionStatus.OUT_OF_DATE]: async () => getOutOfDateDifference({ connection, change }),
    [ChangeDefinitionStatus.NOT_APPLIED]: async () => getNotAppliedDifference({ change }),
  };
  const getDifferenceMethod = getDifferenceMethods[change.status];
  return getDifferenceMethod();
};
