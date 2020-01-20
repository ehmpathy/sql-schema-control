import chalk from 'chalk';
import { RequiredAction, DefinitionPlan } from '../../../types';

export const getColoredPlanTitle = ({ plan }: { plan: DefinitionPlan }) => {
  // define action string
  const actionChalk = {
    [RequiredAction.APPLY]: chalk.green,
    [RequiredAction.NO_CHANGE]: chalk.gray,
    [RequiredAction.REAPPLY]: chalk.yellow,
    [RequiredAction.MANUAL_REAPPLY]: chalk.red,
    [RequiredAction.MANUAL_MIGRATION]: chalk.red,
    [RequiredAction.MANUAL_PULL]: chalk.red,
  }[plan.action];
  const actionString = actionChalk(`[${plan.action}]`);

  // define the identifier string
  const identifierString = chalk.grey(`(${plan.id})`);

  // define the header
  const title = chalk.bold(`${actionString} ${plan.definition.path} ${identifierString}`);

  // return header
  return title;
};
