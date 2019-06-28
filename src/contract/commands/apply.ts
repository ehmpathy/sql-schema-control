import { Command, flags } from '@oclif/command';
import { getAndApplyPlans } from '../../logic/workflows/getAndApplyPlans';

export default class Apply extends Command {
  public static description = 'apply an execution plan';

  public static examples = [
    `$ schema-control apply -c src/contract/_test_assets/control.yml
    [APPLY] ./tables/data_source.sql
    [APPLY] ./tables/notification.sql
    [APPLY] ./init/data_sources.sql
    [APPLY] ./procedures/find_message_hash_by_text.sql
    [APPLY] ./procedures/upsert_message.sql
  ✖ [APPLY] ./init/service_user.sql
    → Could not apply ./init/service_user.sql: Operation CREATE USER failed for
…
Could not apply ./init/service_user.sql: Operation CREATE USER failed for 'user_name'@'%'
    `,
  ];

  public static flags = {
    help: flags.help({ char: 'h' }),
    config: flags.string({ char: 'c', description: 'path to config file', default: 'schema/control.yml' }),
  };

  public async run() {
    const { flags } = this.parse(Apply);
    const config = flags.config!;

    // apply changes
    const configPath = (config.slice(0, 1) === '/') ? config : `${process.cwd()}/${config}`; // if starts with /, consider it as an absolute path
    await getAndApplyPlans({ configPath });
  }
}
