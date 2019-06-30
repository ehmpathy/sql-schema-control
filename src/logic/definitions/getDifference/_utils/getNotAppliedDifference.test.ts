import uuid from 'uuid/v4';
import sha256 from 'simple-sha256';
import { ChangeDefinition, ChangeDefinitionStatus } from '../../../../types';
import { getNotAppliedDifference } from './getNotAppliedDifference';

describe('getNotAppliedDifference', () => {
  it('should return the full sql colored as the diff', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.NOT_APPLIED,
    });
    const result = await getNotAppliedDifference({ definition });
    expect(typeof result).toEqual('string');
    expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
  });
});
