import { ResourceDefinition, ResourceDefinitionStatus, RequiredAction, ResourceType } from '../../../types';
import { getRequiredActionForResource } from './getRequiredActionForResource';

const baseResource = new ResourceDefinition({
  type: ResourceType.TABLE,
  name: '__NAME__',
  path: '__PATH__',
  sql: '__SQL__',
});

describe('getRequiredActionForResource', () => {
  it('should find no action required if resource is synced', () => {
    const resource = new ResourceDefinition({ ...baseResource, status: ResourceDefinitionStatus.SYNCED });
    const action = getRequiredActionForResource({ definition: resource });
    expect(action).toEqual(RequiredAction.NO_CHANGE);
  });
  it('should find apply required for resource with status NOT_APPLIED', () => {
    const resource = new ResourceDefinition({ ...baseResource, status: ResourceDefinitionStatus.NOT_APPLIED });
    const action = getRequiredActionForResource({ definition: resource });
    expect(action).toEqual(RequiredAction.APPLY);
  });
  it('should find manual_pull required for resource with status NOT_CONTROLED', () => {
    const resource = new ResourceDefinition({ ...baseResource, status: ResourceDefinitionStatus.NOT_CONTROLED });
    const action = getRequiredActionForResource({ definition: resource });
    expect(action).toEqual(RequiredAction.MANUAL_PULL);
  });
  it('should find reapply required for change with status OUT_OF_SYNC when resource is a procedure', () => {
    const resource = new ResourceDefinition({ ...baseResource, status: ResourceDefinitionStatus.OUT_OF_SYNC, type: ResourceType.PROCEDURE });
    const action = getRequiredActionForResource({ definition: resource });
    expect(action).toEqual(RequiredAction.REAPPLY);
  });
  it('should find reapply required for change with status OUT_OF_SYNC when resource is a function', () => {
    const resource = new ResourceDefinition({ ...baseResource, status: ResourceDefinitionStatus.OUT_OF_SYNC, type: ResourceType.FUNCTION });
    const action = getRequiredActionForResource({ definition: resource });
    expect(action).toEqual(RequiredAction.REAPPLY);
  });
  it('should find manual_migration required for change with status OUT_OF_SYNC when resource is a table', () => {
    const resource = new ResourceDefinition({ ...baseResource, status: ResourceDefinitionStatus.OUT_OF_SYNC, type: ResourceType.TABLE });
    const action = getRequiredActionForResource({ definition: resource });
    expect(action).toEqual(RequiredAction.MANUAL_MIGRATION);
  });
});
