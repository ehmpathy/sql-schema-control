import process from 'process';

import { ControlConfig } from '../../../../types';
import { readConfig } from './readConfig';

describe('readConfig', () => {
  it('should be able to read the example config provisioned in _test_assets', async () => {
    const config = await readConfig({
      filePath: `${__dirname}/_test_assets/control.yml`,
    });
    expect(config.constructor).toEqual(ControlConfig);
    expect(config.language).toEqual('mysql');
    expect(config.dialect).toEqual('5.7');
    expect(config.connection).toMatchObject({
      host: '__HOST__',
      port: 3306,
      database: '__DATABASE__',
      schema: '__SCHEMA__',
      username: '__USERNAME__',
      password: '__PASSWORD__',
    });
    expect(config.definitions.length).toEqual(6); // 4 changes, 2 resource

    // replace the "cwd" from each of the paths w/ a hardcoded string, since we dont want to tie test to any particular env (e.g., your machine vs my machine vs cicd)
    config.definitions = config.definitions.map((definition) => ({
      ...definition,
      path: definition.path!.replace(process.cwd(), '__CWD__'),
    }));

    expect(config).toMatchSnapshot(); // to log an example of the output
  });
});
