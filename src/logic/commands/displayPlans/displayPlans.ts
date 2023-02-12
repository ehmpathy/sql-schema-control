import chalk from 'chalk';
import indentString from 'indent-string';

import { DefinitionPlan, RequiredAction } from '../../../types';
import { getColoredActionToken } from '../utils/getColoredActionToken';
import { getColoredPlanTitle } from '../utils/getColoredPlanTitle';

type StatsForPlan = { [index in RequiredAction]: number };
const countTimesActionRequired = ({
  plans,
  action,
}: {
  plans: DefinitionPlan[];
  action: RequiredAction;
}) => plans.filter((plan) => plan.action === action).length;

export const displayPlans = async ({ plans }: { plans: DefinitionPlan[] }) => {
  // add padding to output
  console.log(chalk.bold('Planning required actions...')); // tslint:disable-line
  console.log(''); // tslint:disable-line

  // filter out nochange plans
  const plansWithChange = plans.filter(
    (plan) => plan.action !== RequiredAction.NO_CHANGE,
  );
  if (!plansWithChange.length) {
    console.log(
      `\n${chalk.bold('Everything is up to date 🎉')}. No actions required.`,
    ); // tslint:disable-line no-console
    return; // exit here if no plans
  }

  // define plans output
  const output = plansWithChange // skip plans that have no change
    .map((plan) => {
      // define plan header
      const header = `  * ${getColoredPlanTitle({ plan })}`;

      // define the diff
      const diff = plan.difference
        ? `\n${indentString(plan.difference, 6)}\n`
        : '';

      // append to output
      return header + diff;
    });

  // define the plans summary
  const stats: StatsForPlan = {
    [RequiredAction.NO_CHANGE]: countTimesActionRequired({
      plans,
      action: RequiredAction.NO_CHANGE,
    }),
    [RequiredAction.APPLY]: countTimesActionRequired({
      plans,
      action: RequiredAction.APPLY,
    }),
    [RequiredAction.REAPPLY]: countTimesActionRequired({
      plans,
      action: RequiredAction.REAPPLY,
    }),
    [RequiredAction.MANUAL_PULL]: countTimesActionRequired({
      plans,
      action: RequiredAction.MANUAL_PULL,
    }),
    [RequiredAction.MANUAL_REAPPLY]: countTimesActionRequired({
      plans,
      action: RequiredAction.MANUAL_REAPPLY,
    }),
    [RequiredAction.MANUAL_MIGRATION]: countTimesActionRequired({
      plans,
      action: RequiredAction.MANUAL_MIGRATION,
    }),
  };
  const statsToSummaryRows = Object.entries(stats)
    .filter((entry) => entry[1] > 0)
    .map(
      ([action, count]) =>
        `  * ${getColoredActionToken({
          action: action as RequiredAction,
        })} ${count}`,
    );
  const statsOutput = `
${chalk.bold('Summary...')}

${statsToSummaryRows.join('\n')}
  `.trim();

  // display the output in one statement to make it easier on testing
  console.log([...output, '', statsOutput].join('\n')); // tslint:disable-line no-console
};
