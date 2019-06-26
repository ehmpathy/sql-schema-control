import uuid from 'uuid/v4';
import sha256 from 'simple-sha256';
import { ChangeDefinition, ChangeDefinitionStatus, DefinitionType } from '../../../../types';
import { getNotAppliedDifference } from './getNotAppliedDifference';

describe('getNotAppliedDifference', () => {
  it('should throw an error if the ChangeDefinition.status !== NOT_APPLIED', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.OUT_OF_DATE,
    });
    try {
      await getNotAppliedDifference({ change: definition });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual(`change.status must be ${ChangeDefinitionStatus.NOT_APPLIED} to get diff`);
    }
  });
  it('should return the full sql colored green as the diff', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.NOT_APPLIED,
    });
    const result = await getNotAppliedDifference({ change: definition });
    expect(typeof result).toEqual('string');
    expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
  });
});
