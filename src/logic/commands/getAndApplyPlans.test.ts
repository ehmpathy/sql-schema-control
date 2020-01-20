import { getAndApplyPlans } from './getAndApplyPlans';
import { applyPlans } from './applyPlans';
import { getControlContextFromConfig } from '../config/getControlContextFromConfig';
import { getPlans } from './getPlans';

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

jest.mock('./applyPlans');
const applyPlansMock = applyPlans as jest.Mock;

describe('getAndApplyPlans', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should get the control context from config', async () => {
    await getAndApplyPlans({ configPath: '__CONFIG_PATH__' });
    expect(getControlContextFromConfigMock.mock.calls.length).toEqual(1);
    expect(getControlContextFromConfigMock.mock.calls[0][0]).toEqual({
      configPath: '__CONFIG_PATH__',
    });
  });
  it('should get the plans', async () => {
    await getAndApplyPlans({ configPath: '__CONFIG_PATH__' });
    expect(getPlansMock.mock.calls.length).toEqual(1);
    expect(getPlansMock.mock.calls[0][0]).toEqual({
      context: exampleContext,
    });
  });
  it('should apply the plans', async () => {
    const exampleResolvedPlans = ['__PLAN_ONE__', '__PLAN_TWO__'];
    getPlansMock.mockResolvedValueOnce(exampleResolvedPlans);
    await getAndApplyPlans({ configPath: '__CONFIG_PATH__' });
    expect(applyPlansMock.mock.calls.length).toEqual(1);
    expect(applyPlansMock.mock.calls[0][0]).toEqual({
      connection: exampleContext.connection,
      plans: exampleResolvedPlans,
    });
  });
  it('should close the connection', async () => {
    await getAndApplyPlans({ configPath: '__CONFIG_PATH__' });
    expect(exampleContext.connection.end.mock.calls.length).toEqual(1);
  });
});
