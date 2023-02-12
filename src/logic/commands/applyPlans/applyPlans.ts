import chalk from 'chalk';

import {
  RequiredAction,
  DefinitionPlan,
  DatabaseConnection,
} from '../../../domain';
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
  // add padding to output
  console.log(chalk.bold('Applying required actions...')); // tslint:disable-line
  console.log(''); // tslint:disable-line

  // apply each plan
  for (const plan of plans) {
    // if no change, dont even mention it
    if (plan.action === RequiredAction.NO_CHANGE) continue;

    // if cant apply, notify we're skipping
    const canApply = [RequiredAction.APPLY, RequiredAction.REAPPLY].includes(
      plan.action,
    );
    if (!canApply) {
      console.log(
        `  ${chalk.bold(chalk.yellow('↓'))} ${getColoredPlanTitle({ plan })}`,
      ); // tslint:disable-line no-console
      continue;
    }

    // if can apply, then try to apply
    try {
      await applyPlan({ connection, plan });
      console.log(
        `  ${chalk.bold(chalk.green('✔'))} ${getColoredPlanTitle({ plan })}`,
      ); // tslint:disable-line no-console
    } catch (error) {
      console.log(
        `  ${chalk.bold(chalk.red('x'))} ${getColoredPlanTitle({ plan })}\n`,
      ); // tslint:disable-line no-console
      console.log(error.message); // tslint:disable-line no-console
      throw error;
    }
  }
};
