import sha256 from 'simple-sha256';
import { DatabaseLanguage, DatabaseConnection, ResourceType } from '../constants';
import { ChangeDefinition } from './ChangeDefinition';
import { ResourceDefinition } from './ResourceDefinition';
import { ControlContext } from './ControlContext';

describe('ConnectionConfig', () => {
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
  const exampleDbConnection: DatabaseConnection = {
    query: (() => {}) as any,
    end: (() => {}) as any,
    language: DatabaseLanguage.POSTGRES,
    schema: 'public',
  };
  it('should initialize for valid inputs', () => {
    const config = new ControlContext({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: exampleDbConnection,
      definitions: [changeDefinition, resourceDefinition],
    });
    expect(config).toMatchObject({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: exampleDbConnection,
      definitions: [changeDefinition, resourceDefinition],
    });
  });
  it('should throw error on invalid input', () => {
    try {
      new ControlContext({
        languagzzze: 'mysql',
        dialect: '5.7',
        connection: exampleDbConnection,
        definitions: [changeDefinition],
      } as any); // tslint:disable-line no-unused-expression
    } catch (error) {
      expect(error.constructor.name).toEqual('ValidationError');
    }
  });
});
