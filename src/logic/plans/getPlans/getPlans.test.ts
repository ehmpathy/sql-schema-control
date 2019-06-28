import { getPlans } from './getPlans';
import { getDefinitionPlan } from '../../definitions/getDefinitionPlan';

jest.mock('../../definitions/getDefinitionPlan');
const getDefinitionPlanMock = getDefinitionPlan as jest.Mock;
getDefinitionPlanMock.mockResolvedValue('__PLAN__');

describe('getPlans', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should should get plan for definition for each definition', async () => {
    const definitions = ['__DEF_1__', '__DEF_2__'];
    await getPlans({ context: { definitions } as any });
    expect(getDefinitionPlanMock.mock.calls.length).toEqual(definitions.length); // once per definition
  });
  it('should return the plans', async () => {
    const definitions = ['__DEF_1__', '__DEF_2__'];
    const plans = await getPlans({ context: { definitions } as any });
    expect(plans).toEqual(definitions.map(() => '__PLAN__'));
  });
});
