import {
  ResourceDefinition,
  ResourceDefinitionStatus,
  ResourceType,
} from '../../../domain';
import { getControlContextFromConfig } from '../../config/getControlContextFromConfig';
import { getPlans } from '../getPlans';
import { pullAndRecordUncontrolledResources } from './pullAndRecordUncontrolledResources';
import { recordUncontrolledResources } from './recordUncontrolledResources';

jest.mock('../../config/getControlContextFromConfig');
const getControlContextFromConfigMock =
  getControlContextFromConfig as jest.Mock;
const exampleContext = {
  connection: {
    end: jest.fn(),
  },
};
getControlContextFromConfigMock.mockResolvedValue(exampleContext);

jest.mock('../getPlans');
const getPlansMock = getPlans as jest.Mock;
const exampleResources = [
  new ResourceDefinition({
    path: '__SOME_PATH__',
    sql: '__SOME_SQL__',
    type: ResourceType.FUNCTION,
    name: '__EXAMPLE_RESOURCE_NAME_ONE__',
    status: ResourceDefinitionStatus.NOT_CONTROLLED,
  }),
  new ResourceDefinition({
    path: '__SOME_PATH__',
    sql: '__SOME_SQL__',
    type: ResourceType.FUNCTION,
    name: '__EXAMPLE_RESOURCE_NAME_TWO__',
  }),
];
getPlansMock.mockResolvedValue([
  { definition: exampleResources[0] },
  { definition: exampleResources[1] },
]);

jest.mock('./recordUncontrolledResources');
const recordUncontrolledResourcesMock =
  recordUncontrolledResources as jest.Mock;

describe('pullAndRecordUncontrolledResources', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should get the control context from config', async () => {
    await pullAndRecordUncontrolledResources({
      configPath: '__CONFIG_PATH__',
      targetDir: '__TARGET_DIR__',
    });
    expect(getControlContextFromConfigMock.mock.calls.length).toEqual(1);
    expect(getControlContextFromConfigMock.mock.calls[0][0]).toEqual({
      configPath: '__CONFIG_PATH__',
      strict: true, // must be strict to get uncontrolled resources returned
    });
  });
  it('should get the plans', async () => {
    await pullAndRecordUncontrolledResources({
      configPath: '__CONFIG_PATH__',
      targetDir: '__TARGET_DIR__',
    });
    expect(getPlansMock.mock.calls.length).toEqual(1);
    expect(getPlansMock.mock.calls[0][0]).toEqual({
      context: exampleContext,
    });
  });
  it('should close the connection', async () => {
    await pullAndRecordUncontrolledResources({
      configPath: '__CONFIG_PATH__',
      targetDir: '__TARGET_DIR__',
    });
    expect(exampleContext.connection.end.mock.calls.length).toEqual(1);
  });
  it('should record only the uncontrolled resource', async () => {
    await pullAndRecordUncontrolledResources({
      configPath: '__CONFIG_PATH__',
      targetDir: '__TARGET_DIR__',
    });
    expect(recordUncontrolledResourcesMock.mock.calls.length).toEqual(1);
    expect(recordUncontrolledResourcesMock.mock.calls[0][0]).toEqual({
      targetDir: '__TARGET_DIR__',
      uncontrolledResources: [exampleResources[0]], // only the first one is 'NOT_CONTROLLED'
    });
  });
});
