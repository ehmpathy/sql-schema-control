import sha256 from 'simple-sha256';

import {
  ChangeDefinition,
  ResourceDefinition,
  ResourceType,
} from '../../domain';
import { getDifferenceForChangeDefinition } from './changeDefinition/getDifferenceForChangeDefinition';
import { getDifferenceForDefinition } from './getDifferenceForDefinition';
import { getDifferenceForResourceDefinition } from './resourceDefinition/getDifferenceForResourceDefinition';

jest.mock('./changeDefinition/getDifferenceForChangeDefinition');
const getChangeDifferenceMock = getDifferenceForChangeDefinition as jest.Mock;
getChangeDifferenceMock.mockReturnValue('__CHANGE_DIFF__');

jest.mock('./resourceDefinition/getDifferenceForResourceDefinition');
const getResourceDifferenceMock =
  getDifferenceForResourceDefinition as jest.Mock;
getResourceDifferenceMock.mockReturnValue('__RESOURCE_DIFF__');

describe('getDifferenceForDefinition', () => {
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
    const action = await getDifferenceForDefinition({
      connection: '__CONNECTION__' as any,
      definition: changeDefinition,
    });
    expect(getChangeDifferenceMock.mock.calls.length).toEqual(1);
    expect(getChangeDifferenceMock.mock.calls[0][0]).toEqual({
      connection: '__CONNECTION__',
      change: changeDefinition,
    });
    expect(action).toEqual('__CHANGE_DIFF__');
  });
  it('should getRequiredActionForResource if definition is a ResourceDefinition', async () => {
    const action = await getDifferenceForDefinition({
      connection: '__CONNECTION__' as any,
      definition: resourceDefinition,
    });
    expect(getResourceDifferenceMock.mock.calls.length).toEqual(1);
    expect(getResourceDifferenceMock.mock.calls[0][0]).toEqual({
      connection: '__CONNECTION__',
      resource: resourceDefinition,
    });
    expect(action).toEqual('__RESOURCE_DIFF__');
  });
});
