import Listr from 'listr';
import { RequiredAction, DefinitionPlan, DatabaseConnection } from '../../../types';
import { applyPlan } from './applyPlan';
import { getColoredActionToken } from '../_utils/getColoredActionToken';

/*
  if APPLY or REAPPLY, apply
  else, skip
*/
export const applyPlans = async ({ connection, plans }: { connection: DatabaseConnection, plans: DefinitionPlan[] }) => {
  const tasks = plans
    .filter(plan => [RequiredAction.APPLY, RequiredAction.REAPPLY].includes(plan.action)) // only apply or reapply
    .map((plan): Listr.ListrTask => ({
      title: `${getColoredActionToken({ action: plan.action })} ${plan.definition.path}`,
      task: () => applyPlan({ connection, plan }),
    }));
  const taskSuite = new Listr(tasks);
  await taskSuite.run().catch((err) => {
    console.error(err.message);
  });
};
