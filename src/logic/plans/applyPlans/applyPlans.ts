import Listr from 'listr';
import { RequiredAction, DefinitionPlan, DatabaseConnection } from '../../../types';
import { applyPlan } from './applyPlan';
import { getColoredPlanTitle } from '../_utils/getColoredPlanTitle';

/*
  if APPLY or REAPPLY, apply
  else, skip
*/
export const applyPlans = async ({ connection, plans }: { connection: DatabaseConnection, plans: DefinitionPlan[] }) => {
  const tasks = plans
    .filter(plan => [RequiredAction.APPLY, RequiredAction.REAPPLY].includes(plan.action)) // only apply or reapply
    .map((plan): Listr.ListrTask => ({
      title: getColoredPlanTitle({ plan }),
      task: () => applyPlan({ connection, plan }),
    }));
  const taskSuite = new Listr(tasks);
  await taskSuite.run().catch((err) => {
    console.error(err.message);
  });
};
