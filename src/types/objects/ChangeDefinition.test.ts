import { DefinitionType } from '../constants';
import { ChangeDefinition } from './ChangeDefinition';

describe('ChangeDefinition', () => {
  it('should initialize for valid inputs', () => {
    const changeDefinition = new ChangeDefinition({
      type: DefinitionType.CHANGE,
      id: 'cool_change_20190619_1',
      path: './relative/path.sql',
    });
    expect(changeDefinition).toMatchObject({
      type: DefinitionType.CHANGE,
      id: 'cool_change_20190619_1',
      path: './relative/path.sql',
    });
  });
  it('should throw error on invalid input', () => {
    try {
      new ChangeDefinition({
        tyzype: DefinitionType.CHANGE,
        id: 'cool_change_20190619_1',
        path: './relative/path.sql',
      } as any); // tslint:disable-line no-unused-expression
    } catch (error) {
      expect(error.constructor.name).toEqual('ValidationError');
    }
  });
});
