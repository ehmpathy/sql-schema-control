import { Command } from 'commander';

import { getAndApplyPlans } from '@src/domain.operations/commands/getAndApplyPlans';
import { getAndDisplayPlans } from '@src/domain.operations/commands/getAndDisplayPlans';
import { getAndSyncChangeLogForChangeDefinition } from '@src/domain.operations/commands/getAndSyncChangeLogForChangeDefinition';
import { pullAndRecordUncontrolledResources } from '@src/domain.operations/commands/pullAndRecordUncontrolledResources';

/**
 * .what = convert config path to absolute
 * .why = support both relative and absolute paths
 */
const asAbsoluteConfigPath = (input: { config: string }): string =>
  input.config.startsWith('/')
    ? input.config
    : `${process.cwd()}/${input.config}`;

/**
 * .what = create and configure the cli program
 * .why = single entry point for all commands
 */
export const createProgram = (): Command => {
  const program = new Command();

  program
    .name('sql-schema-control')
    .description(
      'Declarative database schema management. Provision, track, sync, and modify your database schema with plain, version controlled, sql.',
    )
    .version('1.7.1');

  // plan command
  program
    .command('plan')
    .description('generate and show an execution plan')
    .option('-c, --config <path>', 'path to config file', 'schema/control.yml')
    .action(async (options: { config: string }) => {
      const configPath = asAbsoluteConfigPath({ config: options.config });
      await getAndDisplayPlans({ configPath });
    });

  // apply command
  program
    .command('apply')
    .description('apply an execution plan')
    .option('-c, --config <path>', 'path to config file', 'schema/control.yml')
    .action(async (options: { config: string }) => {
      const configPath = asAbsoluteConfigPath({ config: options.config });
      await getAndApplyPlans({ configPath });
    });

  // sync command
  program
    .command('sync')
    .description(
      'sync the change log for a specific change definition without applying it, for cases where a change has been reapplied manually',
    )
    .option('-c, --config <path>', 'path to config file', 'schema/control.yml')
    .requiredOption('--id <changeId>', 'reference id of the change definition')
    .action(async (options: { config: string; id: string }) => {
      const configPath = asAbsoluteConfigPath({ config: options.config });
      await getAndSyncChangeLogForChangeDefinition({
        configPath,
        changeId: options.id,
      });
    });

  // pull command
  program
    .command('pull')
    .description('pull and record uncontrolled resources')
    .option('-c, --config <path>', 'path to config file', 'schema/control.yml')
    .option(
      '-t, --target <path>',
      'target directory to record uncontrolled resources in',
      'schema',
    )
    .action(async (options: { config: string; target: string }) => {
      const configPath = asAbsoluteConfigPath({ config: options.config });
      const targetDir = options.target.startsWith('/')
        ? options.target
        : `${process.cwd()}/${options.target}`;
      await pullAndRecordUncontrolledResources({ configPath, targetDir });
    });

  return program;
};

/**
 * .what = run the cli
 * .why = entry point for bin/run
 */
export const run = async (): Promise<void> => {
  const program = createProgram();
  await program.parseAsync(process.argv);
};
