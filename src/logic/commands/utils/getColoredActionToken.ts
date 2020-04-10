import chalk from 'chalk';

import { RequiredAction } from '../../../types';

export const getColoredActionToken = ({ action }: { action: RequiredAction }) => {
  // define action color
  const actionChalk = {
    [RequiredAction.APPLY]: chalk.green,
    [RequiredAction.NO_CHANGE]: chalk.gray,
    [RequiredAction.REAPPLY]: chalk.yellow,
    [RequiredAction.MANUAL_REAPPLY]: chalk.red,
    [RequiredAction.MANUAL_MIGRATION]: chalk.red,
    [RequiredAction.MANUAL_PULL]: chalk.red,
  }[action];

  // return the token
  return chalk.bold(actionChalk(`[${action}]`));
};
