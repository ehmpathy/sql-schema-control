import { DatabaseConnection, ChangeDefinition, ResourceDefinition, DefinitionPlan, RequiredAction } from '../../types';
import { getRequiredAction } from './getRequiredAction';
import { getStatusForDefinition } from '../schema/getStatusForDefinition';
import { getDifferenceForDefinition } from '../schema/getDifferenceForDefinition';

export const getPlanForDefinition = async ({
  connection,
  definition: definitionWithoutStatus,
}: {
  connection: DatabaseConnection;
  definition: ChangeDefinition | ResourceDefinition;
}) => {
  // 1. ensure definition has a status
  const definition = await getStatusForDefinition({ connection, definition: definitionWithoutStatus });

  // 2. determine the required action
  const action = getRequiredAction({ definition });

  // 3. determine the difference to display
  const difference =
    action === RequiredAction.APPLY
      ? null // if action = APPLY, don't display a difference - there is nothing to compare it against in the db (it _will_ throw error if we try)
      : await getDifferenceForDefinition({ connection, definition });

  // 4. define a logical identifier for the plan
  const definitionType = definition instanceof ChangeDefinition ? 'change' : 'resource';
  const definitionId =
    definition instanceof ChangeDefinition ? definition.id : `${definition.type.toLowerCase()}:${definition.name}`;
  const planIdentifier = `${definitionType}:${definitionId}`;

  // 5. build and return the plan object
  return new DefinitionPlan({
    id: planIdentifier,
    definition,
    difference: difference ? difference : undefined,
    action,
  });
};
