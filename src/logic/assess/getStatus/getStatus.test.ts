import { DefinitionType } from '../../../types';
import { getChangeStatus } from './getChangeStatus';
import { getStatus } from './getStatus';

jest.mock('./getChangeStatus');
const getChangeStatusMock = getChangeStatus as jest.Mock;

describe('getStatus', () => {
  it('should throw an error if no adaptor is defined for the definition.type', async () => {
    try {
      await getStatus({ connection: '__CONNECTION__' as any, definition: { type: '__UNKNOWN__' } as any });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual('definition type is not supported');
    }

  });
  it('should use the correct adaptor for a ChangeDefinition', async () => {
    const definition = { type: DefinitionType.CHANGE } as any;
    await getStatus({ definition, connection: '__CONNECTION__' as any });
    expect(getChangeStatusMock.mock.calls.length).toEqual(1);
    expect(getChangeStatusMock.mock.calls[0][0]).toEqual({
      connection: '__CONNECTION__',
      change:  definition,
    });
  });
});
