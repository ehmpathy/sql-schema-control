import sha256 from 'simple-sha256';
import { ChangeDefinition, ResourceDefinition, ResourceType } from '../../../types';
import { getDifference } from './getDifference';
import { getChangeDifference } from './getChangeDifference';
import { getResourceDifference } from './getResourceDifference';

jest.mock('./getChangeDifference');
const getChangeDifferenceMock = getChangeDifference as jest.Mock;
getChangeDifferenceMock.mockReturnValue('__CHANGE_DIFF__');

jest.mock('./getResourceDifference');
const getResourceDifferenceMock = getResourceDifference as jest.Mock;
getResourceDifferenceMock.mockReturnValue('__RESOURCE_DIFF__');

describe('getRequiredAction', () => {
  const resourceDefinition = new ResourceDefinition({
    type: ResourceType.TABLE,
    name: '__NAME__',
    path: '__PATH__',
    sql: '__SQL__',
  });
  const changeDefinition = new ChangeDefinition({
    id: '__ID__',
    path: '__PATH__',
    sql: '__SQL__',
    hash: sha256.sync('__SQL__'),
  });
  it('should getRequiredActionForChange if definition is a ChangeDefinition', async () => {
    const action = await getDifference({ connection: '__CONNECTION__' as any, definition: changeDefinition });
    expect(getChangeDifferenceMock.mock.calls.length).toEqual(1);
    expect(getChangeDifferenceMock.mock.calls[0][0]).toEqual({
      connection: '__CONNECTION__',
      change: changeDefinition,
    });
    expect(action).toEqual('__CHANGE_DIFF__');
  });
  it('should getRequiredActionForResource if definition is a ResourceDefinition', async () => {
    const action = await getDifference({ connection: '__CONNECTION__' as any, definition: resourceDefinition });
    expect(getResourceDifferenceMock.mock.calls.length).toEqual(1);
    expect(getResourceDifferenceMock.mock.calls[0][0]).toEqual({
      connection: '__CONNECTION__',
      resource: resourceDefinition,
    });
    expect(action).toEqual('__RESOURCE_DIFF__');
  });
});
