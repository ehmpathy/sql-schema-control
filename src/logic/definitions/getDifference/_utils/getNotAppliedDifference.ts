import chalk from 'chalk';
import { ChangeDefinition, ResourceDefinition } from '../../../../types';

export const getNotAppliedDifference = async ({ definition }: { definition: ChangeDefinition | ResourceDefinition }) => {
  // declare the 'diff' as the full sql
  return chalk.gray(definition.sql);
};
