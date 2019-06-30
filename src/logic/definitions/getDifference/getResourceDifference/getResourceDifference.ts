import { DatabaseConnection, ResourceDefinition, ResourceDefinitionStatus } from '../../../../types';
import { getOutOfDateDifference } from './getOutOfDateDifference';
import { getNotAppliedDifference } from '../_utils/getNotAppliedDifference';

/*
  for the definition:
    - per status, return difference
*/
export const getResourceDifference = async ({ connection, resource }: { connection: DatabaseConnection, resource: ResourceDefinition }): Promise<string | null> => {
  if (!resource.status) throw new Error('status must be defined to determine difference');
  const getDifferenceMethods = {
    [ResourceDefinitionStatus.SYNCED]: async () => null,
    [ResourceDefinitionStatus.OUT_OF_SYNC]: async () => getOutOfDateDifference({ connection, resource }),
    [ResourceDefinitionStatus.NOT_APPLIED]: async () => getNotAppliedDifference({ definition: resource }),
    [ResourceDefinitionStatus.NOT_CONTROLED]: async () => getNotAppliedDifference({ definition: resource }),
  };
  const getDifferenceMethod = getDifferenceMethods[resource.status];
  return getDifferenceMethod();
};
