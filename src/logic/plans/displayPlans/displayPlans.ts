import chalk from 'chalk';
import indentString from 'indent-string';
import { DefinitionPlan } from '../../../types';
import { getColoredActionToken } from '../_utils/getColoredActionToken';

export const displayPlans = async ({ plans }: { plans: DefinitionPlan[] }) => {
  // define plans output
  const output: string[] = [];
  plans.forEach((plan) => {
    // define action string
    const actionString = getColoredActionToken({ action: plan.action });

    // define extra details
    const extraDetails = chalk.gray(`(id: ${plan.definition.id})`);

    // define the header
    const header = chalk.bold((`\n * ${actionString} ${plan.definition.path} ${extraDetails} \n`));

    // define the diff
    const diff = (plan.difference) ? `\n${indentString(plan.difference, 4)}` : '';

    // append to output
    output.push(header + diff);
  });

  // display the output in one statement to make it easier on testing
  console.log(output.join('\n'));
};
