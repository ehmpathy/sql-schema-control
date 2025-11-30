import { Command, Flags } from '@oclif/core';

import { getAndSyncChangeLogForChangeDefinition } from '../../logic/commands/getAndSyncChangeLogForChangeDefinition';

export default class Sync extends Command {
  public static description =
    'sync the change log for a specific change definition without applying it, for cases where a change has been reapplied manually';

  public static examples = [
    `$ sql-schema-control sync -c src/contract/.test/assets/control.yml --id init_service_user
  ✔ [SYNC] ./init/service_user.sql (change:init_service_user)
    `,
  ];

  public static flags = {
    help: Flags.help({ char: 'h' }),
    config: Flags.string({
      char: 'c',
      description: 'path to config file',
      default: 'schema/control.yml',
    }),
    id: Flags.string({
      name: 'id',
      description: 'reference id of the change definition',
      required: true,
    }),
  };

  public async run() {
    const { flags } = await this.parse(Sync);
    const config = flags.config!;
    const changeId = flags.id;

    // apply changes
    const configPath =
      config.slice(0, 1) === '/' ? config : `${process.cwd()}/${config}`; // if starts with /, consider it as an absolute path
    await getAndSyncChangeLogForChangeDefinition({ configPath, changeId });
  }
}
