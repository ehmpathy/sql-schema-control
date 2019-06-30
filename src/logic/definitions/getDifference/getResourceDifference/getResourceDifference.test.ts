import { ResourceDefinition, ResourceType, ResourceDefinitionStatus } from '../../../../types';
import { getResourceDifference } from './getResourceDifference';
import { getOutOfDateDifference } from './getOutOfDateDifference';
import { getNotAppliedDifference } from '../_utils/getNotAppliedDifference';

jest.mock('./getOutOfDateDifference');
const getOutOfDateDifferenceMock = getOutOfDateDifference as jest.Mock;
getOutOfDateDifferenceMock.mockResolvedValue('__OUT_OF_DATE_DIFF__');

jest.mock('../_utils/getNotAppliedDifference');
const getNotAppliedDifferenceMock = getNotAppliedDifference as jest.Mock;
getNotAppliedDifferenceMock.mockResolvedValue('__NOT_APPLIED_DIFF__');

describe('getResourceDifference', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should throw an error if there is no status on the definition', async () => {
    const definition = new ResourceDefinition({
      type: ResourceType.TABLE,
      name: '__NAME__',
      path: '__PATH__',
      sql: '__SQL__',
    });
    try {
      await getResourceDifference({ connection: {} as any, resource: definition });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual('status must be defined to determine difference');
    }
  });
  it('should return null if change.status = SYNCED', async () => {
    const definition = new ResourceDefinition({
      type: ResourceType.TABLE,
      name: '__NAME__',
      path: '__PATH__',
      sql: '__SQL__',
      status: ResourceDefinitionStatus.SYNCED,
    });
    const diff = await getResourceDifference({ connection: {} as any, resource: definition });
    expect(diff).toEqual(null);
  });
  it('should return the result of getOutOfDateDifference for change.status = OUT_OF_SYNC', async () => {
    const definition = new ResourceDefinition({
      type: ResourceType.TABLE,
      name: '__NAME__',
      path: '__PATH__',
      sql: '__SQL__',
      status: ResourceDefinitionStatus.OUT_OF_SYNC,
    });
    const diff = await getResourceDifference({ connection: '__CONNECTION__' as any, resource: definition });
    expect(getOutOfDateDifferenceMock.mock.calls.length).toEqual(1);
    expect(getOutOfDateDifferenceMock.mock.calls[0][0]).toEqual({
      connection: '__CONNECTION__',
      resource: definition,
    });
    expect(diff).toEqual('__OUT_OF_DATE_DIFF__');
  });
  it('should return the result of getNotAppliedDifference for change.status = NOT_APPLIED', async () => {
    const definition = new ResourceDefinition({
      type: ResourceType.TABLE,
      name: '__NAME__',
      path: '__PATH__',
      sql: '__SQL__',
      status: ResourceDefinitionStatus.NOT_APPLIED,
    });
    const diff = await getResourceDifference({ connection: {} as any, resource: definition });
    expect(getNotAppliedDifferenceMock.mock.calls.length).toEqual(1);
    expect(getNotAppliedDifferenceMock.mock.calls[0][0]).toEqual({
      definition,
    });
    expect(diff).toEqual('__NOT_APPLIED_DIFF__');
  });
  it('should return the result of getNotAppliedDifference for change.status = NOT_CONTROLED', async () => {
    const definition = new ResourceDefinition({
      type: ResourceType.TABLE,
      name: '__NAME__',
      path: '__PATH__',
      sql: '__SQL__',
      status: ResourceDefinitionStatus.NOT_CONTROLED,
    });
    const diff = await getResourceDifference({ connection: {} as any, resource: definition });
    expect(getNotAppliedDifferenceMock.mock.calls.length).toEqual(1);
    expect(getNotAppliedDifferenceMock.mock.calls[0][0]).toEqual({
      definition,
    });
    expect(diff).toEqual('__NOT_APPLIED_DIFF__');
  });
});
