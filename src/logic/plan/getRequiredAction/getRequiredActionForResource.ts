import { ResourceDefinition, ResourceDefinitionStatus, RequiredAction, ResourceType } from '../../../types';

export const getRequiredActionForResource = ({ definition }: { definition: ResourceDefinition }) => {
  if (definition.status === ResourceDefinitionStatus.SYNCED) return RequiredAction.NO_CHANGE;
  if (definition.status === ResourceDefinitionStatus.NOT_APPLIED) return RequiredAction.APPLY;
  if (definition.status === ResourceDefinitionStatus.NOT_CONTROLLED) return RequiredAction.MANUAL_PULL;
  if (definition.status === ResourceDefinitionStatus.OUT_OF_SYNC) {
    if (definition.type === ResourceType.FUNCTION || definition.type === ResourceType.PROCEDURE) {
      return RequiredAction.REAPPLY; // only sprocs and funcs can be dropped and recreated by reapplying
    }
    return RequiredAction.MANUAL_MIGRATION; // if its any other resource, a migration is necessary; TODO - support automated migrations / migration help
  }
  throw new Error('unexpected definition status. this is an error with schema-control'); // just warn the user that if they see this, something went wrong with our package
};
