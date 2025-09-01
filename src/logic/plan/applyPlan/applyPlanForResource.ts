import { UnexpectedCodePathError } from 'helpful-errors';

import {
  RequiredAction,
  DefinitionPlan,
  DatabaseConnection,
  ResourceDefinition,
  ResourceType,
} from '../../../domain';

const REAPPLIABLE_RESOURCES = [
  ResourceType.FUNCTION,
  ResourceType.PROCEDURE,
  ResourceType.VIEW,
]; // these resources don't persist data
export const applyPlanForResource = async ({
  connection,
  plan,
}: {
  connection: DatabaseConnection;
  plan: DefinitionPlan;
}) => {
  // grab the resource
  if (plan.definition.constructor !== ResourceDefinition)
    throw new Error('must be resource');
  const resource = plan.definition as ResourceDefinition;

  // 1. if we need to reapply, try to drop the resource first
  if (plan.action === RequiredAction.REAPPLY) {
    if (!REAPPLIABLE_RESOURCES.includes(resource.type))
      throw new Error(`resource ${plan.id} is not reappliable`); // if we can't drop this resource (i.e., its a table) throw an error
    try {
      const shouldCascade = resource.type === ResourceType.VIEW;
      await connection.query({
        sql: `DROP ${resource.type} ${resource.name} ${
          shouldCascade ? 'CASCADE' : ''
        }`,
      });
    } catch (error) {
      if (!(error instanceof Error)) throw error;

      // if we're told it does not exist, then do nothing. it must have been previously removed via cascade
      if (!error.message.includes('does not exist')) throw error;
    }
  }

  // 2. apply it
  try {
    await connection.query({ sql: resource.sql });
  } catch (error) {
    throw new Error(
      `Could not apply ${plan.definition.path}: ${error.message}`,
    );
  }
};
