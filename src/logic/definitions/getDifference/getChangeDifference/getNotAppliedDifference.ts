import chalk from 'chalk';
import { ChangeDefinition, ChangeDefinitionStatus } from '../../../../types';

export const getNotAppliedDifference = async ({ change }: { change: ChangeDefinition }) => {
  // 0. throw an error if change status is not NOT_APPLIED
  if (change.status !== ChangeDefinitionStatus.NOT_APPLIED) throw new Error(`change.status must be ${ChangeDefinitionStatus.NOT_APPLIED} to get diff`);

  // 1. declare the 'diff' as the full sql as new content (i.e., color green)
  return chalk.gray(change.sql);
};
