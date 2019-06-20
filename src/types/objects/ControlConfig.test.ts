import { DatabaseLanguage, DefinitionType } from '../constants';
import { ConnectionConfig } from './ConnectionConfig';
import { ChangeDefinition } from './ChangeDefinition';
import { ControlConfig } from './ControlConfig';

describe('ConnectionConfig', () => {
  const connectionConfig = new ConnectionConfig({
    host: 'localhost',
    port: 3306,
    schema: 'awesome_schema',
    username: 'service_user',
    password: 'super_secure_password',
  });
  const changeDefinition = new ChangeDefinition({
    type: DefinitionType.CHANGE,
    id: 'cool_change_20190619_1',
    path: './relative/path.sql',
  });
  it('should initialize for valid inputs', () => {
    const config = new ControlConfig({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: connectionConfig,
      definitions: [changeDefinition],
    });
    expect(config).toMatchObject({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: connectionConfig,
      definitions: [changeDefinition],
    });
  });
  it('should throw error on invalid input', () => {
    try {
      new ControlConfig({
        languagzzze: 'mysql',
        dialect: '5.7',
        connection: connectionConfig,
        definitions: [changeDefinition],
      } as any); // tslint:disable-line no-unused-expression
    } catch (error) {
      expect(error.constructor.name).toEqual('ValidationError');
    }
  });
});
