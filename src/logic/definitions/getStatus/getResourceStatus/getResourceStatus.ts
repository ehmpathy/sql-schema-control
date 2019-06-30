import { DatabaseConnection, ResourceDefinition, ResourceDefinitionStatus } from '../../../../types';
import { getResourceFromDatabase, ResourceDoesNotExistError } from '../../_utils/getResourceFromDatabase';

/*
  check if matching live definition can be found
    - if not, return NOT_APPLIED
    - if found, check if content is same or different
      - if same, status = SYNCED
      - if not same, status = OUT_OF_SYNC
*/
export const getResourceStatus = async ({ connection, resource }: { connection: DatabaseConnection, resource: ResourceDefinition }) => {
  // 1. SHOW CREATE of this resource
  try {
    const liveResource = await getResourceFromDatabase({ connection, resourceType: resource.type, resourceName: resource.name });
    return new ResourceDefinition({ // if the error said doesn't exist, then this was not applied
      ...resource,
      status: (resource.sql === liveResource.sql) ? ResourceDefinitionStatus.SYNCED : ResourceDefinitionStatus.OUT_OF_SYNC,
    });
  } catch (error) {
    if (error.constructor !== ResourceDoesNotExistError) throw error;
    return new ResourceDefinition({ // if the error said doesn't exist, then this was not applied
      ...resource,
      status: ResourceDefinitionStatus.NOT_APPLIED,
    });
  }
};
