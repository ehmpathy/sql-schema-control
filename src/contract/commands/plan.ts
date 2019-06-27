import { Command, flags } from '@oclif/command';
import { getAndDisplayPlans } from '../../logic/workflows/getAndDisplayPlans';

export default class Plan extends Command {
  public static description = 'generate and show an execution plan';

  public static examples = [
    `$ schema-control plan

 * [APPLY] ./init/service_user.sql (id: init_20190619_1)

    CREATE USER 'user_name'@'%';
    GRANT ALL PRIVILEGES ON awesomedb.* To 'user_name'@'%' IDENTIFIED BY '__CHANGE_M3__'; -- change password in real db
    `,
  ];

  public static flags = {
    help: flags.help({ char: 'h' }),
    config: flags.string({ char: 'c', description: 'path to config file', default: 'schema/control.yml' }),
  };

  public async run() {
    const { flags } = this.parse(Plan);
    const config = flags.config!;

    // get and display the plans
    const configPath = (config.slice(0, 1) === '/') ? config : `${process.cwd()}/${config}`; // if starts with /, consider it as an absolute path
    await getAndDisplayPlans({ configPath });
  }
}
