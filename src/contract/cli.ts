import { Command } from 'commander';
import { BadRequestError } from 'helpful-errors';

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
    .option(
      '--exid <changeExid>',
      '(required) the change definition exid (natural key)',
    )
    .option('--id <deprecated>', '[renamed] use --exid instead') // kept only to give a clear error; --id was hard-cut
    .action(async (options: { config: string; exid?: string; id?: string }) => {
      // the --id flag was renamed to --exid; guide users who still pass --id
      if (options.id !== undefined)
        throw new BadRequestError(
          "the '--id' flag was renamed to '--exid'. use: sync --exid <exid>",
          { id: options.id },
        );

      // require the exid, now that it is not a commander requiredOption
      if (options.exid === undefined)
        throw new BadRequestError(
          "the '--exid' option is required (the change definition's natural key)",
          { hint: 'sync --exid <exid>' },
        );

      const configPath = asAbsoluteConfigPath({ config: options.config });
      await getAndSyncChangeLogForChangeDefinition({
        configPath,
        changeExid: options.exid,
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
