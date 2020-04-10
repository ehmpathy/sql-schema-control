import chalk from 'chalk';
import { ChangeDefinition, ResourceDefinition } from '../../../types';
import { getReferenceIdForDefinition } from '../../schema/getReferenceIdForDefinition';

export const getColoredActionTitle = ({
  actionToken,
  definition,
}: {
  actionToken: string;
  definition: ChangeDefinition | ResourceDefinition;
}) => {
  // define the identifier string
  const identifierString = chalk.grey(`(${getReferenceIdForDefinition({ definition })})`);

  // define the header
  const title = chalk.bold(`${actionToken} ${definition.path!} ${identifierString}`);

  // return header
  return title;
};
