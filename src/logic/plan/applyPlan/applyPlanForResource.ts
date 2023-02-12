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
    await connection.query({ sql: `DROP ${resource.type} ${resource.name}` });
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
