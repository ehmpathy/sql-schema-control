import chalk from 'chalk';
import { RequiredAction, DefinitionPlan } from '../../../types';

export const getColoredPlanTitle = ({ plan }: { plan: DefinitionPlan }) => {
  // define action string
  const actionChalk = {
    [RequiredAction.APPLY]: chalk.green,
    [RequiredAction.NO_CHANGE]: chalk.gray,
    [RequiredAction.REAPPLY]: chalk.yellow,
    [RequiredAction.MANUAL_REAPPLY]: chalk.red,
  }[plan.action];
  const actionString = actionChalk(`[${plan.action}]`);

  // define extra details
  const extraDetails = chalk.gray(`(id: ${plan.definition.id})`);

  // define the header
  const title = chalk.bold((`${actionString} ${plan.definition.path} ${extraDetails}`));

  // return header
  return title;
};
