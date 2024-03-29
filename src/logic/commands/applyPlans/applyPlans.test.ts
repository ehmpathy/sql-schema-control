import sha256 from 'simple-sha256';
import { stdout } from 'stdout-stderr';

import {
  ChangeDefinition,
  DefinitionPlan,
  RequiredAction,
} from '../../../domain';
import { applyPlan } from '../../plan/applyPlan';
import { applyPlans } from './applyPlans';

jest.mock('../../plan/applyPlan');
const applyPlanMock = applyPlan as jest.Mock;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
applyPlanMock.mockImplementation(() => sleep(500));

const exampleDefinition = new ChangeDefinition({
  id: '__UUID__',
  path: '__PATH__',
  sql: '__SQL__',
  hash: sha256.sync('__SQL__'),
});
const plan = new DefinitionPlan({
  id: '__SOME_ID__',
  definition: exampleDefinition,
  difference: '__APPLY_DIFFERENCE__',
  action: RequiredAction.APPLY,
});
const noChangePlan = new DefinitionPlan({
  id: '__SOME_ID__',
  definition: exampleDefinition,
  difference: '__NO_CHANGE_DIFFERENCE__',
  action: RequiredAction.NO_CHANGE,
});
const reapplyPlan = new DefinitionPlan({
  id: '__SOME_ID__',
  definition: exampleDefinition,
  difference: '__REAPPLY_DIFFERENCE__',
  action: RequiredAction.REAPPLY,
});
const manualReapplyPlan = new DefinitionPlan({
  id: '__SOME_ID__',
  definition: exampleDefinition,
  difference: '__MANUAL_REAPPLY_DIFFERENCE__',
  action: RequiredAction.MANUAL_REAPPLY,
});

describe('applyPlans', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should attempt to apply each plan', async () => {
    await applyPlans({
      connection: {} as any,
      plans: [plan, plan, reapplyPlan],
    });
    expect(applyPlanMock.mock.calls.length).toEqual(3);
    expect(applyPlanMock.mock.calls[0][0]).toMatchObject({
      // check correct input
      plan,
    });
  });
  it('should not attempt to apply NO_CHANGE or MANUAL_REAPPLY plans', async () => {
    await applyPlans({
      connection: {} as any,
      plans: [plan, noChangePlan, manualReapplyPlan, reapplyPlan],
    });
    expect(applyPlanMock.mock.calls.length).toEqual(2);
  });
  it('should display MANUAL_REAPPLY as skipped', async () => {
    stdout.stripColor = false;
    stdout.start();
    await applyPlans({
      connection: {} as any,
      plans: [plan, noChangePlan, manualReapplyPlan, reapplyPlan],
    });
    stdout.stop();
    const output = stdout.output
      .split('\n')
      .filter((line) => !line.includes('console.log'))
      .join('\n') // strip the console log portion
      .replace(/\[\d\d:\d\d:\d\d\]/g, ''); // remove all timestamps, since they change over time...
    expect(output).toContain('[MANUAL_REAPPLY]');
  });
  it('should not display NO_CHANGE as skipped', async () => {
    stdout.stripColor = false;
    stdout.start();
    await applyPlans({
      connection: {} as any,
      plans: [plan, noChangePlan, manualReapplyPlan, reapplyPlan],
    });
    stdout.stop();
    const output = stdout.output
      .split('\n')
      .filter((line) => !line.includes('console.log'))
      .join('\n') // strip the console log portion
      .replace(/\[\d\d:\d\d:\d\d\]/g, ''); // remove all timestamps, since they change over time...
    expect(output).not.toContain('[NO_CHANGE]');
  });
  it('should display an expected output for the plans', async () => {
    stdout.stripColor = false;
    stdout.start();
    await applyPlans({ connection: {} as any, plans: [plan, reapplyPlan] });
    stdout.stop();
    const output = stdout.output
      .split('\n')
      .filter((line) => !line.includes('console.log'))
      .join('\n') // strip the console log portion
      .replace(/\[\d\d:\d\d:\d\d\]/g, ''); // remove all timestamps, since they change over time...
    expect(output).toMatchSnapshot();
  });
});
