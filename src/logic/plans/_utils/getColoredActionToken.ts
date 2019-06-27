import chalk from 'chalk';
import { RequiredAction } from '../../../types';

export const getColoredActionToken = ({ action }: { action: RequiredAction }) => {
  const actionChalk = {
    [RequiredAction.APPLY]: chalk.green,
    [RequiredAction.NO_CHANGE]: chalk.gray,
    [RequiredAction.REAPPLY]: chalk.yellow,
    [RequiredAction.MANUAL_REAPPLY]: chalk.red,
  }[action];
  const actionString = chalk.bold(actionChalk(`[${action}]`));
  return actionString;
};
