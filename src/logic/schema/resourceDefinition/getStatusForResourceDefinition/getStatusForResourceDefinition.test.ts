import { ResourceDefinition, ResourceType, ResourceDefinitionStatus } from '../../../../types';
import { getDifferenceForResourceDefinition } from '../getDifferenceForResourceDefinition';
import { getStatusForResourceDefinition } from './getStatusForResourceDefinition';
import { ResourceDoesNotExistError } from '../getLiveResourceDefinitionFromDatabase';

jest.mock('../getDifferenceForResourceDefinition');
const getDifferenceForResourceDefinitionMock = getDifferenceForResourceDefinition as jest.Mock;

describe('getResourceStatus', () => {
  const resource = new ResourceDefinition({
    name: 'example_resource',
    type: ResourceType.TABLE,
    sql: '__SQL__',
  });
  it('should use getResourceCreateStatement accurately', async () => {
    getDifferenceForResourceDefinitionMock.mockReturnValueOnce({ sql: '__SQL__' });
    await getStatusForResourceDefinition({ connection: '__CONNECTION__' as any, resource });
    expect(getDifferenceForResourceDefinitionMock).toHaveBeenCalledTimes(1);
    expect(getDifferenceForResourceDefinitionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resource,
        connection: '__CONNECTION__',
      }),
    );
  });
  it('should return status = NOT_APPLIED if getResourceCreateStatement throws ResourceDoesNotExistError', async () => {
    getDifferenceForResourceDefinitionMock.mockRejectedValueOnce(
      new ResourceDoesNotExistError({ resourceName: 'name', resourceType: ResourceType.FUNCTION }),
    );
    const resourceStatus = await getStatusForResourceDefinition({ connection: '__CONNECTION__' as any, resource });
    expect(resourceStatus).toEqual(ResourceDefinitionStatus.NOT_APPLIED);
  });
  it('should return status = OUT_OF_SYNC if diff exists', async () => {
    getDifferenceForResourceDefinitionMock.mockResolvedValueOnce('__DIFFERENCE__');
    const resourceStatus = await getStatusForResourceDefinition({ connection: '__CONNECTION__' as any, resource });
    expect(resourceStatus).toEqual(ResourceDefinitionStatus.OUT_OF_SYNC);
  });
  it('should return status of SYNCED if no diff', async () => {
    getDifferenceForResourceDefinitionMock.mockResolvedValueOnce(null);
    const resourceStatus = await getStatusForResourceDefinition({ connection: '__CONNECTION__' as any, resource });
    expect(resourceStatus).toEqual(ResourceDefinitionStatus.SYNCED);
  });
});
