import chalk from 'chalk';
import indentString from 'indent-string';
import { Command, flags } from '@oclif/command';
import { getPlan } from '../../logic/workflows/getPlan';

export default class Plan extends Command {
  public static description = 'generate and show an execution plan';

//   public static examples = [
//     `$ schema-control plan
// hello world from ./src/hello.ts!
// `,
//   ];

  public static flags = {
    help: flags.help({ char: 'h' }),
    config: flags.string({ char: 'c', description: 'path to config file', default: 'schema/control.yml' }),
  };

  public async run() {
    const { flags } = this.parse(Plan);
    const config = flags.config!;

    // get plans
    const plans = await getPlan({ configPath: `${process.cwd()}/${config}` });

    // display plans
    // console.log(plans);
    plans.forEach((plan) => {
      // TODO: display relative path to file instead of id (this will be generic across change and resources as well as being more helpful)
      // TODO: make the "apply" a general header, and group by required action
      // TODO: add a description of what this means
      console.log(chalk.bold(chalk.green(`[${plan.action}] ${plan.definition.id}`)));
      if (plan.difference) console.log(indentString(plan.difference, 4));
    });
  }
}
