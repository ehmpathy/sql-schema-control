import indentString from 'indent-string';
import { DefinitionPlan } from '../../../types';
import { getColoredPlanTitle } from '../utils/getColoredPlanTitle';

export const displayPlans = async ({ plans }: { plans: DefinitionPlan[] }) => {
  // define plans output
  const output: string[] = [];
  plans.forEach((plan) => {
    // define plan header
    const header = `  * ${getColoredPlanTitle({ plan })}`;

    // define the diff
    const diff = plan.difference ? `\n${indentString(plan.difference, 6)}` : '';

    // append to output
    output.push(header + diff);
  });

  // display the output in one statement to make it easier on testing
  console.log(output.join('\n')); // tslint:disable-line no-console
};
