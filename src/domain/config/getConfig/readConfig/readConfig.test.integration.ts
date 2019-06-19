import { readConfig } from './readConfig';

describe('readConfig', () => {
  it('should be able to read the example config provisioned in _test_utils', async () => {
    const config = await readConfig({ filePath: `${__dirname}/_test_utils/control.yml` });
    expect(config.language).toEqual('mysql');
    expect(config.dialect).toEqual(5.7);
    expect(config.connection).toMatchObject({
      host: '__HOST__',
      port: 3306,
      schema: '__SCHEMA__',
      username: '__USERNAME__',
      password: '__PASSWORD__',
    });
    expect(config.definitions.length).toEqual(4);
    expect(config).toMatchSnapshot(); // to log an example of the output
  });
});
