import { DatabaseConnection, DefinitionPlan, ChangeDefinition, ResourceDefinition } from '../../../types';
import { applyPlanForChange } from './applyPlanForChange';
import { applyPlanForResource } from './applyPlanForResource';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const applyPlan = async ({ connection, plan }: { connection: DatabaseConnection; plan: DefinitionPlan }) => {
  await sleep(150); // purely aesthetic; TODO: make optional
  if (plan.definition.constructor === ChangeDefinition) return applyPlanForChange({ connection, plan });
  if (plan.definition.constructor === ResourceDefinition) return applyPlanForResource({ connection, plan });
  throw new Error('unexpected definition type');
};
