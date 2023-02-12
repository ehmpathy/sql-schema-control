import { ChangeDefinition, ResourceDefinition } from '../../../domain';
import { getRequiredActionForChange } from './getRequiredActionForChange';
import { getRequiredActionForResource } from './getRequiredActionForResource';

export const getRequiredAction = ({
  definition,
}: {
  definition: ChangeDefinition | ResourceDefinition;
}) => {
  if (definition.constructor === ChangeDefinition) {
    return getRequiredActionForChange({
      definition: definition as ChangeDefinition,
    });
  }
  if (definition.constructor === ResourceDefinition) {
    return getRequiredActionForResource({
      definition: definition as ResourceDefinition,
    });
  }
  throw new Error('unexpected definition type');
};
