import { DatabaseConnection, ChangeDefinition, ResourceDefinition, DefinitionPlan } from '../../types';
import { getRequiredAction } from './getRequiredAction';
import { getDifference } from './getDifference';

export const getDefinitionPlan = async ({ connection, definition }: { connection: DatabaseConnection, definition: ChangeDefinition | ResourceDefinition }) => {
  // 1. determine the required action
  const action = getRequiredAction({ definition });

  // 2. determine the difference
  const difference = await getDifference({ connection, definition });

  // 4. define a logical identifier for the plan
  const definitionType = (definition.constructor === ChangeDefinition) ? 'change' : 'resource';
  const definitionId = (definition.constructor === ChangeDefinition)
    ? (definition as ChangeDefinition).id
    : `${(definition as ResourceDefinition).type.toLowerCase()}:${(definition as ResourceDefinition).name}`;
  const planIdentifier = `${definitionType}:${definitionId}`;

  // 3. build and return the plan object
  return new DefinitionPlan({
    id: planIdentifier,
    definition,
    difference: (difference) ? difference : undefined,
    action,
  });
};
