import {
  DatabaseConnection,
  DefinitionPlan,
  ChangeDefinition,
  ResourceDefinition,
} from '../../../types';
import { applyPlanForChange } from './applyPlanForChange';
import { applyPlanForResource } from './applyPlanForResource';

export const applyPlan = async ({
  connection,
  plan,
}: {
  connection: DatabaseConnection;
  plan: DefinitionPlan;
}) => {
  if (plan.definition.constructor === ChangeDefinition)
    return applyPlanForChange({ connection, plan });
  if (plan.definition.constructor === ResourceDefinition)
    return applyPlanForResource({ connection, plan });
  throw new Error('unexpected definition type');
};
