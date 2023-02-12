import { Command, Flags } from '@oclif/core';
import { pullAndRecordUncontrolledResources } from '../../logic/commands/pullAndRecordUncontrolledResources';

export default class Plan extends Command {
  public static description = 'pull and record uncontrolled resources';

  public static examples = [
    `$ sql-schema-control pull -c src/contract/_test_assets/control.yml -t src/contract/_test_assets/uncontrolled
pulling uncontrolled resource definitions into .../schema-control/src/contract/commands/_test_assets/uncontrolled
  ✓ [PULLED] resource:table:data_source
  ✓ [PULLED] resource:table:invitation
  ✓ [PULLED] resource:procedure:upsert_invitation
  ✓ [PULLED] resource:function:get_id_by_name
    `,
  ];

  public static flags = {
    help: Flags.help({ char: 'h' }),
    config: Flags.string({ char: 'c', description: 'path to config file', default: 'schema/control.yml' }),
    target: Flags.string({
      char: 't',
      description: 'target directory to record uncontrolled resources in',
      default: 'schema',
    }),
  };

  public async run() {
    const { flags } = await this.parse(Plan);
    const config = flags.config!;
    const target = flags.target!;

    // get and display the plans
    const configPath = config.slice(0, 1) === '/' ? config : `${process.cwd()}/${config}`; // if starts with /, consider it as an absolute path
    const targetDir = target.slice(0, 1) === '/' ? target : `${process.cwd()}/${target}`; // if starts with /, consider it as an absolute path
    await pullAndRecordUncontrolledResources({ configPath, targetDir });
  }
}
