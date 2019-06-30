import { ResourceDefinition, ResourceType, ResourceDefinitionStatus } from '../../../types';
import { getUncontrolledResources } from './getUncontrolledResources';
import { pullResources } from './pullResources';

jest.mock('./pullResources');
const pullResourcesMock = pullResources as jest.Mock;
const exampleLiveResources = [
  new ResourceDefinition({
    path: '__SOME_PATH__',
    sql: '__SOME_SQL__',
    type: ResourceType.FUNCTION,
    name: '__EXAMPLE_RESOURCE_NAME_ONE__',
  }),
  new ResourceDefinition({
    path: '__SOME_PATH__',
    sql: '__SOME_SQL__',
    type: ResourceType.FUNCTION,
    name: '__EXAMPLE_RESOURCE_NAME_TWO__',
  }),
];
pullResourcesMock.mockResolvedValue(exampleLiveResources);

describe('getUncontrolledResources', () => {
  it('should pull resources accurately', async () => {
    await getUncontrolledResources({ connection: '__CONNECTION__' as any, controlledResources: [] as any });
    expect(pullResourcesMock.mock.calls.length).toEqual(1);
    expect(pullResourcesMock.mock.calls[0][0]).toMatchObject({
      connection: '__CONNECTION__',
    });
  });
  it('should find that a resource from pullResources that does not exist in liveResources is uncontrolled', async () => {
    const liveResource = new ResourceDefinition({
      path: '__SOME_PATH__',
      sql: '__SOME_SQL__',
      type: ResourceType.FUNCTION,
      name: '__EXAMPLE_RESOURCE_NAME_TWO__',
    });
    pullResourcesMock.mockResolvedValueOnce([liveResource]);
    const controlledResources = [new ResourceDefinition({ ...liveResource, name: '__NOT_SAME_NAME__' })];
    const uncontrolledResources = await getUncontrolledResources({ connection: '__CONNECTION__' as any, controlledResources });
    expect(uncontrolledResources.length).toEqual(1);
    expect(uncontrolledResources[0].name).toEqual(liveResource.name);
  });
  it('should find that a resource in pullResources that does exist in liveResource is controlled', async () => {
    const liveResource = new ResourceDefinition({
      path: '__SOME_PATH__',
      sql: '__SOME_SQL__',
      type: ResourceType.FUNCTION,
      name: '__EXAMPLE_RESOURCE_NAME_TWO__',
    });
    pullResourcesMock.mockResolvedValueOnce([liveResource]);
    const controlledResources = [liveResource];
    const uncontrolledResources = await getUncontrolledResources({ connection: '__CONNECTION__' as any, controlledResources });
    expect(uncontrolledResources.length).toEqual(0);
  });
  it('should return all uncontrolled resources with status = NOT_CONTROLLED', async () => {
    const uncontrolledResources = await getUncontrolledResources({ connection: '__CONNECTION__' as any, controlledResources: [] as any });
    uncontrolledResources.map(uncontrolledResource => expect(uncontrolledResource.status).toEqual(ResourceDefinitionStatus.NOT_CONTROLED));
  });
  it('should return all uncontrolled resources with path = identifier', async () => {
    const liveResource = new ResourceDefinition({
      path: '__SOME_PATH__',
      sql: '__SOME_SQL__',
      type: ResourceType.FUNCTION,
      name: '__EXAMPLE_RESOURCE_NAME_TWO__',
    });
    pullResourcesMock.mockResolvedValueOnce([liveResource]);
    const uncontrolledResources = await getUncontrolledResources({ connection: '__CONNECTION__' as any, controlledResources: [] as any });
    uncontrolledResources.map(uncontrolledResource => expect(uncontrolledResource.path).toEqual(`${liveResource.type.toLowerCase()}:${liveResource.name}`));
  });
});
