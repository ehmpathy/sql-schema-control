import chalk from 'chalk';
import indentString from 'indent-string';
import { Command, flags } from '@oclif/command';
import { getPlan } from '../../logic/workflows/getPlan';
import { RequiredAction } from '../../types';

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

    // get plans
    const configPath = (config.slice(0, 1) === '/') ? config : `${process.cwd()}/${config}`; // if starts with /, consider it as an absolute path
    const plans = await getPlan({ configPath });

    // define plans output
    const output: string[] = [];
    plans.forEach((plan) => {
      // define action string
      const actionChalk = {
        [RequiredAction.APPLY]: chalk.green,
        [RequiredAction.NO_CHANGE]: chalk.gray,
        [RequiredAction.REAPPLY]: chalk.yellow,
        [RequiredAction.MANUAL_REAPPLY]: chalk.red,
      }[plan.action];
      const actionString = actionChalk(`[${plan.action}]`);

      // define extra details
      const extraDetails = chalk.gray(`(id: ${plan.definition.id})`);

      // define the header
      const header = chalk.bold((`\n * ${actionString} ${plan.definition.path} ${extraDetails} \n`));

      // define the diff
      const diff = (plan.difference) ? `\n${indentString(plan.difference, 4)}` : '';

      // append to output
      output.push(header + diff);
    });

    // display the output
    console.log(output.join('\n'));
  }
}
