import chalk from 'chalk';

import { ChangeDefinition } from '../../types';
import { getControlContextFromConfig } from '../config/getControlContextFromConfig';
import { syncChangeLogWithChangeDefinition } from '../schema/changeDefinition/syncChangelogWithChangeDefinition';
import { getReferenceIdForDefinition } from '../schema/getReferenceIdForDefinition';
import { getColoredActionTitle } from './utils/getColoredActionTitle';

export const getAndSyncChangeLogForChangeDefinition = async ({
  configPath,
  changeId,
}: {
  configPath: string;
  changeId: string;
}) => {
  // 1. get the control context
  const context = await getControlContextFromConfig({ configPath });

  // 2. find the change definition with this id
  const targetDefinition = context.definitions.find(
    (definition) => getReferenceIdForDefinition({ definition }) === `change:${changeId}`,
  );
  if (!targetDefinition) throw new Error(`could not find a definition with referenceId 'change:${changeId}'`);
  if (!(targetDefinition instanceof ChangeDefinition)) throw new Error('can only sync state for change definitions');

  // 3. sync change definition state manually
  await syncChangeLogWithChangeDefinition({ connection: context.connection, definition: targetDefinition });

  // 4. close the connection
  await context.connection.end();

  // 5. notify the user it was successful
  const successMessage = `  ${chalk.green('✔')} ${getColoredActionTitle({
    actionChalk: chalk.green,
    action: 'SYNC',
    definition: targetDefinition,
  })}`;
  console.log('\n', successMessage); // tslint:disable-line no-console
};
