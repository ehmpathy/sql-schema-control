import sha256 from 'simple-sha256';
import { DefinitionType, DatabaseLanguage, DatabaseConnection } from '../constants';
import { ChangeDefinition } from './ChangeDefinition';
import { ControlContext } from './ControlContext';

describe('ConnectionConfig', () => {
  const changeDefinition = new ChangeDefinition({
    type: DefinitionType.CHANGE,
    id: 'cool_change_20190619_1',
    sql: '__SQL__',
    hash: sha256.sync('__SQL__'),
  });
  const exampleDbConnection: DatabaseConnection = { query: (() => {}) as any, end: (() => {}) as any };
  it('should initialize for valid inputs', () => {
    const config = new ControlContext({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: exampleDbConnection,
      definitions: [changeDefinition],
    });
    expect(config).toMatchObject({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: exampleDbConnection,
      definitions: [changeDefinition],
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
