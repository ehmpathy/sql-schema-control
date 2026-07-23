import chalk from 'chalk';
import { BadRequestError, UnexpectedCodePathError } from 'helpful-errors';

import { ChangeDefinition } from '@src/domain';
import { getControlContextFromConfig } from '@src/domain.operations/config/getControlContextFromConfig';
import { syncChangeLogWithChangeDefinition } from '@src/domain.operations/schema/changeDefinition/syncChangelogWithChangeDefinition';
import { getReferenceIdForDefinition } from '@src/domain.operations/schema/getReferenceIdForDefinition';

import { getColoredActionTitle } from './utils/getColoredActionTitle';

export const getAndSyncChangeLogForChangeDefinition = async ({
  configPath,
  changeExid,
}: {
  configPath: string;
  changeExid: string;
}) => {
  // 1. get the control context
  const context = await getControlContextFromConfig({ configPath });

  // 2. find the change definition with this exid
  const targetDefinition = context.definitions.find(
    (definition) =>
      getReferenceIdForDefinition({ definition }) === `change:${changeExid}`,
  );
  if (!targetDefinition)
    throw new BadRequestError(
      `could not find a definition with referenceId 'change:${changeExid}'`,
      { changeExid },
    );
  if (!(targetDefinition instanceof ChangeDefinition))
    throw new UnexpectedCodePathError(
      'referenceId matched a change but the definition is not a ChangeDefinition',
      { changeExid, targetDefinition },
    );

  // 3. sync change definition state manually
  await syncChangeLogWithChangeDefinition({
    connection: context.connection,
    definition: targetDefinition,
  });

  // 4. close the connection
  await context.connection.end();

  // 5. notify the user it was successful
  const successMessage = `  ${chalk.green('✔')} ${getColoredActionTitle({
    actionToken: chalk.green('[SYNC]'),
    definition: targetDefinition,
  })}`;
  console.log('\n', successMessage); // tslint:disable-line no-console
};
