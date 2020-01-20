import chalk from 'chalk';
import { RequiredAction, DefinitionPlan } from '../../../types';
import { getColoredActionTitle } from './getColoredActionTitle';

export const getColoredPlanTitle = ({ plan }: { plan: DefinitionPlan }) => {
  // define action color
  const actionChalk = {
    [RequiredAction.APPLY]: chalk.green,
    [RequiredAction.NO_CHANGE]: chalk.gray,
    [RequiredAction.REAPPLY]: chalk.yellow,
    [RequiredAction.MANUAL_REAPPLY]: chalk.red,
    [RequiredAction.MANUAL_MIGRATION]: chalk.red,
    [RequiredAction.MANUAL_PULL]: chalk.red,
  }[plan.action];

  // return the action title
  return getColoredActionTitle({ actionChalk, action: plan.action, definition: plan.definition });
};
