import { Command, flags } from '@oclif/command';
import { getAndApplyPlans } from '../../logic/commands/getAndApplyPlans';

export default class Apply extends Command {
  public static description = 'apply an execution plan';

  public static examples = [
    `$ sql-schema-control apply -c src/contract/_test_assets/control.yml
  ✔ [APPLY] ./tables/data_source.sql (change:table_20190626_1)
  ✔ [APPLY] ./tables/notification.sql (resource:table:notification)
  ↓ [MANUAL_MIGRATION] ./tables/notification_version.sql (resource:table:notification_version) [skipped]
  ✔ [REAPPLY] ./functions/find_message_hash_by_text.sql (resource:function:find_message_hash_by_text)
  ✔ [APPLY] ./procedures/upsert_message.sql (resource:procedure:upsert_message)
  ✔ [APPLY] ./init/data_sources.sql (change:init_20190619_1)
  ✖ [APPLY] ./init/service_user.sql (change:init_20190619_2)
    → Could not apply ./init/service_user.sql: Operation CREATE USER failed for…

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
    const configPath = config.slice(0, 1) === '/' ? config : `${process.cwd()}/${config}`; // if starts with /, consider it as an absolute path
    await getAndApplyPlans({ configPath });
  }
}
