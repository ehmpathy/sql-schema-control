import { ChangeDefinition, ChangeDefinitionStatus, RequiredAction } from '../../../types';

export const getRequiredActionForChange = ({ definition }: { definition: ChangeDefinition }) => {
  if (definition.status === ChangeDefinitionStatus.UP_TO_DATE) return RequiredAction.NO_CHANGE;
  if (definition.status === ChangeDefinitionStatus.NOT_APPLIED) return RequiredAction.APPLY;
  if (definition.status === ChangeDefinitionStatus.OUT_OF_DATE) {
    if (definition.reappliable) return RequiredAction.REAPPLY;
    return RequiredAction.MANUAL_REAPPLY;
  }
  throw new Error('unexpected definition status. this is an error with schema-control'); // just warn the user that if they see this, something went wrong with our package
};
