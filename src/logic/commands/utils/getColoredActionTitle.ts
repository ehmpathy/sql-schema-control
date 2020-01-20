import chalk, { Chalk } from 'chalk';
import { ChangeDefinition, ResourceDefinition } from '../../../types';
import { getReferenceIdForDefinition } from '../../schema/getReferenceIdForDefinition';

export const getColoredActionTitle = ({
  actionChalk,
  action,
  definition,
}: {
  actionChalk: Chalk;
  action: string;
  definition: ChangeDefinition | ResourceDefinition;
}) => {
  // define action string
  const actionString = actionChalk(`[${action}]`);

  // define the identifier string
  const identifierString = chalk.grey(`(${getReferenceIdForDefinition({ definition })})`);

  // define the header
  const title = chalk.bold(`${actionString} ${definition.path!} ${identifierString}`);

  // return header
  return title;
};
