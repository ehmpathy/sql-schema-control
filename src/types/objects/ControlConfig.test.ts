import sha256 from 'simple-sha256';
import { DatabaseLanguage, ResourceType } from '../constants';
import { ConnectionConfig } from './ConnectionConfig';
import { ChangeDefinition } from './ChangeDefinition';
import { ResourceDefinition } from './ResourceDefinition';
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
    id: 'cool_change_20190619_1',
    path: '__PATH__',
    sql: '__SQL__',
    hash: sha256.sync('__SQL__'),
  });
  const resourceDefinition = new ResourceDefinition({
    path: '__SOME_PATH__',
    sql: '__SQL__',
    name: '__NAME__',
    type: ResourceType.FUNCTION,
  });
  it('should initialize for valid inputs', () => {
    const config = new ControlConfig({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: connectionConfig,
      definitions: [changeDefinition, resourceDefinition],
    });
    expect(config).toMatchObject({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: connectionConfig,
      definitions: [changeDefinition, resourceDefinition],
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
