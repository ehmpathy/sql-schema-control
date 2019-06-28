import sha256 from 'simple-sha256';
import { applyPlans } from './applyPlans';
import { applyPlan } from './applyPlan';
import { ChangeDefinition, DefinitionPlan, DefinitionType, RequiredAction } from '../../../types';
import { stdout } from 'stdout-stderr';

jest.mock('./applyPlan');
const applyPlanMock = applyPlan as jest.Mock;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
applyPlanMock.mockImplementation(() => sleep(500));

const exampleDefinition = new ChangeDefinition({
  id: '__UUID__',
  type: DefinitionType.CHANGE,
  path: '__PATH__',
  sql: '__SQL__',
  hash: sha256.sync('__SQL__'),
});
const plan = new DefinitionPlan({
  definition: exampleDefinition,
  difference: '__APPLY_DIFFERENCE__',
  action: RequiredAction.APPLY,
});
const noChangePlan = new DefinitionPlan({
  definition: exampleDefinition,
  difference: '__NO_CHANGE_DIFFERENCE__',
  action: RequiredAction.NO_CHANGE,
});
const reapplyPlan = new DefinitionPlan({
  definition: exampleDefinition,
  difference: '__REAPPLY_DIFFERENCE__',
  action: RequiredAction.REAPPLY,
});
const manualReapplyPlan = new DefinitionPlan({
  definition: exampleDefinition,
  difference: '__MANUAL_REAPPLY_DIFFERENCE__',
  action: RequiredAction.MANUAL_REAPPLY,
});

process.stdout.isTTY = true;
describe('applyPlans', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should attempt to apply each plan', async () => {
    await applyPlans({ connection: {} as any, plans: [plan, plan, reapplyPlan] });
    expect(applyPlanMock.mock.calls.length).toEqual(3);
    expect(applyPlanMock.mock.calls[0][0]).toMatchObject({ // check correct input
      plan,
    });
  });
  it('should not attempt to apply NO_CHANGE or MANUAL_REAPPLY plans', async () => {
    await applyPlans({ connection: {} as any, plans: [plan, noChangePlan, manualReapplyPlan, reapplyPlan] });
    expect(applyPlanMock.mock.calls.length).toEqual(2);
  });
  it('should display an expected listr output for the plans', async () => {
    process.stdout.isTTY = undefined; // since listr acts differently if nonTTY and jest is nonTTY when more than one test is run
    stdout.stripColor = false;
    stdout.start();
    await applyPlans({ connection: {} as any, plans: [plan, reapplyPlan] });
    stdout.stop();
    const output = stdout.output.split('\n').filter(line => !line.includes('console.log')).join('\n') // strip the console log portion
      .replace(/\[\d\d:\d\d:\d\d\]/g, ''); // remove all timestamps, since they change over time...
    expect(output).toMatchSnapshot();
    process.stdout.isTTY = true;
  });
});
