import { DatabaseConnection, ChangeDefinition, DefinitionPlan } from '../../types';
import { getRequiredAction } from './getRequiredAction';
import { getDifference } from './getDifference';

export const getDefinitionPlan = async ({ connection, definition }: { connection: DatabaseConnection, definition: ChangeDefinition }) => {
  // 1. determine the required action
  const action = getRequiredAction({ definition });

  // 2. determine the difference
  const difference = await getDifference({ connection, definition });

  // 3. build and return the plan object
  return new DefinitionPlan({
    definition,
    difference: (difference) ? difference : undefined,
    action,
  });
};
