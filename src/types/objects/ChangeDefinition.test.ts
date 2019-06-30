import { ChangeDefinition } from './ChangeDefinition';
import sha256 from 'simple-sha256';

describe('ChangeDefinition', () => {
  it('should initialize for valid inputs', () => {
    const changeDefinition = new ChangeDefinition({
      id: 'cool_change_20190619_1',
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    });
    expect(changeDefinition).toMatchObject({
      id: 'cool_change_20190619_1',
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    });
  });
  it('should throw error on invalid input', () => {
    try {
      new ChangeDefinition({
        id: 'cool_change_20190619_1',
        path: './relative/path.sql',
      } as any); // tslint:disable-line no-unused-expression
    } catch (error) {
      expect(error.constructor.name).toEqual('ValidationError');
    }
  });
});
