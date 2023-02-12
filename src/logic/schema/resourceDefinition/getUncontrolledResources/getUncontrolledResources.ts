import {
  DatabaseConnection,
  ResourceDefinition,
  ResourceDefinitionStatus,
} from '../../../../types';
import { pullResources } from './pullResources';

/*
  1. pullResources
  2. compare live resources w/ controlled resources
    - every resource live but not controlled = uncontrolled
  3. return uncontrolled resources
*/
export const getUncontrolledResources = async ({
  connection,
  controlledResources,
}: {
  connection: DatabaseConnection;
  controlledResources: ResourceDefinition[];
}) => {
  // 1. pull resources
  const liveResources = await pullResources({ connection });

  // 2. compare live w/ controlled
  const uncontrolledResources = await liveResources.filter((liveResource) => {
    const controlledResourceExists = controlledResources.some(
      (resource) =>
        resource.name === liveResource.name &&
        resource.type === liveResource.type,
    );
    return !controlledResourceExists; // uncontrolled if controlled resource does not exist
  });

  // 3. set a status of uncontrolled on each resource
  const uncontrolledResourcesWithStatus = uncontrolledResources.map(
    (resource) =>
      new ResourceDefinition({
        ...resource,
        status: ResourceDefinitionStatus.NOT_CONTROLLED,
      }),
  );

  // 4. set a path of not controlled on each resource, for use in display
  const uncontrolledResourcesWithStatusAndPath =
    uncontrolledResourcesWithStatus.map(
      (resource) =>
        new ResourceDefinition({
          ...resource,
          path: `${resource.type.toLowerCase()}:${resource.name}`,
        }),
    );

  // 5. return the uncontrolled resources with status
  return uncontrolledResourcesWithStatusAndPath;
};
