import chalk from 'chalk';
import indentString from 'indent-string';

import { DefinitionPlan, RequiredAction } from '../../../types';
import { getColoredPlanTitle } from '../utils/getColoredPlanTitle';

export const displayPlans = async ({ plans }: { plans: DefinitionPlan[] }) => {
  // filter out nochange plans
  const plansWithChange = plans.filter((plan) => plan.action !== RequiredAction.NO_CHANGE);
  if (!plansWithChange.length) {
    console.log(`\n${chalk.bold('Everything is up to date 🎉')}. No actions required.`); // tslint:disable-line no-console
    return; // exit here if no plans
  }

  // define plans output
  const output = plansWithChange // skip plans that have no change
    .map((plan) => {
      // define plan header
      const header = `  * ${getColoredPlanTitle({ plan })}`;

      // define the diff
      const diff = plan.difference ? `\n${indentString(plan.difference, 6)}` : '';

      // append to output
      return header + diff;
    });

  // display the output in one statement to make it easier on testing
  console.log(['', ...output].join('\n')); // tslint:disable-line no-console
};
