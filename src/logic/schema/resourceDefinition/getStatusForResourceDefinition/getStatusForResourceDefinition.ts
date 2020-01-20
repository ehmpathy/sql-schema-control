import { DatabaseConnection, ResourceDefinition, ResourceDefinitionStatus } from '../../../../types';
import { ResourceDoesNotExistError } from '../getLiveResourceDefinitionFromDatabase';
import { getDifferenceForResourceDefinition } from '../getDifferenceForResourceDefinition';

/*
  check if matching live definition can be found
    - if not, return NOT_APPLIED
    - if found, check if content is same or different
      - if same, status = SYNCED
      - if not same, status = OUT_OF_SYNC
*/
export const getStatusForResourceDefinition = async ({
  connection,
  resource,
}: {
  connection: DatabaseConnection;
  resource: ResourceDefinition;
}) => {
  try {
    const difference = await getDifferenceForResourceDefinition({ connection, resource });
    if (difference === null) return ResourceDefinitionStatus.SYNCED;
    return ResourceDefinitionStatus.OUT_OF_SYNC; // if difference is not null, then its out of sync
  } catch (error) {
    if (error.constructor !== ResourceDoesNotExistError) throw error;
    return ResourceDefinitionStatus.NOT_APPLIED; // if the error said doesn't exist, then this was not applied
  }
};
