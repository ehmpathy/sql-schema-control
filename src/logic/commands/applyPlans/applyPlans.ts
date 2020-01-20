import Listr from 'listr';
import { RequiredAction, DefinitionPlan, DatabaseConnection } from '../../../types';
import { applyPlan } from '../../plan/applyPlan';
import { getColoredPlanTitle } from '../utils/getColoredPlanTitle';

/*
  if APPLY or REAPPLY, apply
  else, skip
*/
export const applyPlans = async ({
  connection,
  plans,
}: {
  connection: DatabaseConnection;
  plans: DefinitionPlan[];
}) => {
  const tasks = plans
    .filter((plan) => plan.action !== RequiredAction.NO_CHANGE) // dont show no_changes as skipped
    .map(
      (plan): Listr.ListrTask => ({
        title: getColoredPlanTitle({ plan }),
        task: () => applyPlan({ connection, plan }),
        skip: () => {
          // show actions that we can not automatically apply as skipped, to remind user that they must manually conduct that action
          const canApply = [RequiredAction.APPLY, RequiredAction.REAPPLY].includes(plan.action);
          if (canApply) return false; // dont skip
          return true;
        },
      }),
    );
  const taskSuite = new Listr(tasks);
  await taskSuite.run().catch((err) => {
    console.error(err.message); // tslint:disable-line no-console
  });
};
