import { Command, flags } from '@oclif/command';
import { getAndSyncChangeLogForChangeDefinition } from '../../logic/commands/getAndSyncChangeLogForChangeDefinition';

export default class Sync extends Command {
  public static description =
    'sync the change log for a specific change definition without applying it, for cases where a change has been reapplied manually';

  public static examples = [
    `$ sql-schema-control sync -c src/contract/__test_assets__/control.yml --id init_service_user
  ✔ [SYNC] ./init/service_user.sql (change:init_service_user)
    `,
  ];

  public static flags = {
    help: flags.help({ char: 'h' }),
    config: flags.string({ char: 'c', description: 'path to config file', default: 'schema/control.yml' }),
    id: flags.string({
      name: 'id',
      description: 'reference id of the change definition',
      required: true,
    }),
  };

  public async run() {
    const { flags } = this.parse(Sync);
    const config = flags.config!;
    const changeId = flags.id;

    // apply changes
    const configPath = config.slice(0, 1) === '/' ? config : `${process.cwd()}/${config}`; // if starts with /, consider it as an absolute path
    await getAndSyncChangeLogForChangeDefinition({ configPath, changeId });
  }
}
