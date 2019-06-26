import { DefinitionType } from '../../../types';
import { getChangeDifference } from './getChangeDifference';
import { getDifference } from './getDifference';

jest.mock('./getChangeDifference');
const getChangeDifferenceMock = getChangeDifference as jest.Mock;

describe('getDifference', () => {
  it('should throw an error if no adaptor is defined for the definition.type', async () => {
    try {
      await getDifference({ connection: '__CONNECTION__' as any, definition: { type: '__UNKNOWN__' } as any });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual('definition type is not supported');
    }

  });
  it('should use the correct adaptor for a ChangeDefinition', async () => {
    const definition = { type: DefinitionType.CHANGE } as any;
    await getDifference({ definition, connection: '__CONNECTION__' as any });
    expect(getChangeDifferenceMock.mock.calls.length).toEqual(1);
    expect(getChangeDifferenceMock.mock.calls[0][0]).toEqual({
      connection: '__CONNECTION__',
      change:  definition,
    });
  });
});
