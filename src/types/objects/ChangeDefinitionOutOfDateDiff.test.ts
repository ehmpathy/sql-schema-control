import { DefinitionType } from '../constants';
import { ChangeDefinition } from './ChangeDefinition';
import { ChangeDefinitionOutOfDateDiff } from './ChangeDefinitionOutOfDateDiff';
import sha256 from 'simple-sha256';

describe('ChangeDefinitionOutOfDateDiff', () => {
  const changeDefinition = new ChangeDefinition({
    type: DefinitionType.CHANGE,
    id: 'cool_change_20190619_1',
    sql: '__SQL__',
    hash: sha256.sync('__SQL__'),
  });
  it('should initialize for valid inputs', () => {
    const diff = new ChangeDefinitionOutOfDateDiff({
      changeDefinition,
      hashDiff: {
        definition: '__IN_DEFINITION_FILE__',
        database: '__WAS_APPLIED_TO_DATABASE__',
      },
      sqlDiff: {
        definition: '__IN_DEFINITION_FILE__',
        database: '__WAS_APPLIED_TO_DATABASE__',
      },
    });
    expect(diff).toMatchObject({
      changeDefinition,
      hashDiff: {
        definition: '__IN_DEFINITION_FILE__',
        database: '__WAS_APPLIED_TO_DATABASE__',
      },
      sqlDiff: {
        definition: '__IN_DEFINITION_FILE__',
        database: '__WAS_APPLIED_TO_DATABASE__',
      },
    });
  });
  it('should throw error on invalid input', () => {
    try {
      new ChangeDefinitionOutOfDateDiff({
        changeDefinition,
        hashDiff: {
          definition: '__IN_DEFINITION_FILE__',
          database: '__WAS_APPLIED_TO_DATABASE__',
        },
        sqlDiff: 'some-string',
      } as any); // tslint:disable-line no-unused-expression
    } catch (error) {
      expect(error.constructor.name).toEqual('ValidationError');
    }
  });
});
