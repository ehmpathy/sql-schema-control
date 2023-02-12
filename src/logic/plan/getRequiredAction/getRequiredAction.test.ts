import sha256 from 'simple-sha256';

import {
  ChangeDefinition,
  ResourceDefinition,
  ResourceType,
} from '../../../domain';
import { getRequiredAction } from './getRequiredAction';
import { getRequiredActionForChange } from './getRequiredActionForChange';
import { getRequiredActionForResource } from './getRequiredActionForResource';

jest.mock('./getRequiredActionForChange');
const getRequiredActionForChangeMock = getRequiredActionForChange as jest.Mock;
getRequiredActionForChangeMock.mockReturnValue('__CHANGE_ACTION__');

jest.mock('./getRequiredActionForResource');
const getRequiredActionForResourceMock =
  getRequiredActionForResource as jest.Mock;
getRequiredActionForResourceMock.mockReturnValue('__RESOURCE_ACTION__');

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
  it('should getRequiredActionForChange if definition is a ChangeDefinition', () => {
    const action = getRequiredAction({ definition: changeDefinition });
    expect(getRequiredActionForChangeMock.mock.calls.length).toEqual(1);
    expect(getRequiredActionForChangeMock.mock.calls[0][0]).toEqual({
      definition: changeDefinition,
    });
    expect(action).toEqual('__CHANGE_ACTION__');
  });
  it('should getRequiredActionForResource if definition is a ResourceDefinition', () => {
    const action = getRequiredAction({ definition: resourceDefinition });
    expect(getRequiredActionForResourceMock.mock.calls.length).toEqual(1);
    expect(getRequiredActionForResourceMock.mock.calls[0][0]).toEqual({
      definition: resourceDefinition,
    });
    expect(action).toEqual('__RESOURCE_ACTION__');
  });
});
