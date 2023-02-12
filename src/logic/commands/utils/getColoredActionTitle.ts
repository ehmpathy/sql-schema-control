import chalk from 'chalk';
import path from 'path';

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
  const identifierString = chalk.grey(
    `(${getReferenceIdForDefinition({ definition })})`,
  );

  // define relative path to file from user's current working directory
  const relativeFilePath = path.relative(process.cwd(), definition.path!);

  // define the header
  const title = chalk.bold(
    `${actionToken} ${relativeFilePath} ${identifierString}`,
  );

  // return header
  return title;
};
