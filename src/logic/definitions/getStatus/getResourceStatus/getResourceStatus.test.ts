import { ResourceDefinition, ResourceType, ResourceDefinitionStatus } from '../../../../types';
import { getResourceStatus } from './getResourceStatus';
import { getResourceFromDatabase, ResourceDoesNotExistError } from '../../_utils/getResourceFromDatabase';

jest.mock('../../_utils/getResourceFromDatabase');
const getResourceFromDatabaseMock = getResourceFromDatabase as jest.Mock;

describe('getResourceStatus', () => {
  const resource = new ResourceDefinition({
    name: 'example_resource',
    type: ResourceType.TABLE,
    sql: '__SQL__',
  });
  it('should use getResourceCreateStatement accurately', async () => {
    getResourceFromDatabaseMock.mockReturnValueOnce({ sql: '__SQL__' });
    await getResourceStatus({ connection: '__CONNECTION__' as any, resource });
    expect(getResourceFromDatabaseMock.mock.calls.length).toEqual(1);
    expect(getResourceFromDatabaseMock.mock.calls[0][0]).toMatchObject({
      resourceName: resource.name,
      resourceType: resource.type,
      connection: '__CONNECTION__',
    });
  });
  it('should return status = NOT_APPLIED if getResourceCreateStatement throws ResourceDoesNotExistError', async () => {
    getResourceFromDatabaseMock.mockRejectedValueOnce(new ResourceDoesNotExistError({ resourceName: 'name', resourceType: ResourceType.FUNCTION }));
    const resourceWithStatus = await getResourceStatus({ connection: '__CONNECTION__' as any, resource });
    expect(resourceWithStatus.status).toEqual(ResourceDefinitionStatus.NOT_APPLIED);
  });
  it('should return status = OUT_OF_SYNC if liveCreateSql !== resource.sql', async () => {
    getResourceFromDatabaseMock.mockResolvedValueOnce({ sql: '__DIFFERENT_SQL__' });
    const resourceWithStatus = await getResourceStatus({ connection: '__CONNECTION__' as any, resource });
    expect(resourceWithStatus.status).toEqual(ResourceDefinitionStatus.OUT_OF_SYNC);
  });
  it('should return status of SYNCED if liveCreateSql === resource.sql', async () => {
    getResourceFromDatabaseMock.mockResolvedValueOnce({ sql: '__SQL__' });
    const resourceWithStatus = await getResourceStatus({ connection: '__CONNECTION__' as any, resource });
    expect(resourceWithStatus.status).toEqual(ResourceDefinitionStatus.SYNCED);
  });
});
