import uuid from 'uuid/v4';
import sha256 from 'simple-sha256';
import { ChangeDefinition, ResourceDefinition, ResourceType } from '../../../types';
import { getChangeStatus } from './getChangeStatus';
import { getResourceStatus } from './getResourceStatus';
import { getStatus } from './getStatus';

jest.mock('./getChangeStatus');
const getChangeStatusMock = getChangeStatus as jest.Mock;

jest.mock('./getResourceStatus');
const getResourceStatusMock = getResourceStatus as jest.Mock;

describe('getStatus', () => {
  it('should throw an error if no adaptor is defined for the definition.type', async () => {
    try {
      await getStatus({ connection: '__CONNECTION__' as any, definition: {} as any });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual('unsupported controlled definition');
    }
  });
  it('should use the correct adaptor for a ChangeDefinition', async () => {
    const change = new ChangeDefinition({
      id: uuid(),
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    });
    await getStatus({ definition: change, connection: '__CONNECTION__' as any });
    expect(getChangeStatusMock.mock.calls.length).toEqual(1);
    expect(getChangeStatusMock.mock.calls[0][0]).toEqual({
      change,
      connection: '__CONNECTION__',
    });
  });
  it('should use the correct adaptor for a ResourceDefinition', async () => {
    const resource = new ResourceDefinition({
      name: 'example_resource',
      type: ResourceType.TABLE,
      sql: '__SQL__',
    });
    await getStatus({ definition: resource, connection: '__CONNECTION__' as any });
    expect(getResourceStatusMock.mock.calls.length).toEqual(1);
    expect(getResourceStatusMock.mock.calls[0][0]).toEqual({
      resource,
      connection: '__CONNECTION__',
    });
  });
});
