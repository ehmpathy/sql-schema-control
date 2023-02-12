import {
  ResourceDefinition,
  ResourceDefinitionStatus,
  RequiredAction,
  ResourceType,
} from '../../../types';

const REAPPLIABLE_RESOURCE = [
  ResourceType.FUNCTION,
  ResourceType.PROCEDURE,
  ResourceType.VIEW,
];
export const getRequiredActionForResource = ({
  definition,
}: {
  definition: ResourceDefinition;
}) => {
  if (definition.status === ResourceDefinitionStatus.SYNCED)
    return RequiredAction.NO_CHANGE;
  if (definition.status === ResourceDefinitionStatus.NOT_APPLIED)
    return RequiredAction.APPLY;
  if (definition.status === ResourceDefinitionStatus.NOT_CONTROLLED)
    return RequiredAction.MANUAL_PULL;
  if (definition.status === ResourceDefinitionStatus.OUT_OF_SYNC) {
    if (REAPPLIABLE_RESOURCE.includes(definition.type)) {
      return RequiredAction.REAPPLY; // only sprocs, funcs, and views can be dropped and recreated by reapplying
    }
    return RequiredAction.MANUAL_MIGRATION; // if its any other resource, a migration is necessary; TODO - support automated migrations / migration help
  }
  throw new Error(
    'unexpected definition status. this is an error with sql-schema-control',
  ); // just warn the user that if they see this, something went wrong with our package
};
