import { getAndDisplayPlans } from './getAndDisplayPlans';
import { getControlContextFromConfig } from '../config/getControlContextFromConfig';
import { getPlans } from './getPlans';
import { displayPlans } from './displayPlans';

jest.mock('../config/getControlContextFromConfig');
const getControlContextFromConfigMock = getControlContextFromConfig as jest.Mock;
const exampleContext = {
  connection: {
    end: jest.fn(),
  },
};
getControlContextFromConfigMock.mockResolvedValue(exampleContext);

jest.mock('./getPlans');
const getPlansMock = getPlans as jest.Mock;

jest.mock('./displayPlans');
const displayPlansMock = displayPlans as jest.Mock;

describe('getAndDisplayPlans', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should get the control context from config', async () => {
    await getAndDisplayPlans({ configPath: '__CONFIG_PATH__' });
    expect(getControlContextFromConfigMock.mock.calls.length).toEqual(1);
    expect(getControlContextFromConfigMock.mock.calls[0][0]).toEqual({
      configPath: '__CONFIG_PATH__',
    });
  });
  it('should get the plans', async () => {
    await getAndDisplayPlans({ configPath: '__CONFIG_PATH__' });
    expect(getPlansMock.mock.calls.length).toEqual(1);
    expect(getPlansMock.mock.calls[0][0]).toEqual({
      context: exampleContext,
    });
  });
  it('should close the connection', async () => {
    await getAndDisplayPlans({ configPath: '__CONFIG_PATH__' });
    expect(exampleContext.connection.end.mock.calls.length).toEqual(1);
  });
  it('should display the plans', async () => {
    const exampleResolvedPlans = ['__PLAN_ONE__', '__PLAN_TWO__'];
    getPlansMock.mockResolvedValueOnce(exampleResolvedPlans);
    await getAndDisplayPlans({ configPath: '__CONFIG_PATH__' });
    expect(displayPlansMock.mock.calls.length).toEqual(1);
    expect(displayPlansMock.mock.calls[0][0]).toEqual({
      plans: exampleResolvedPlans,
    });
  });
});
