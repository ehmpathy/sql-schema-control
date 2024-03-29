import Chalk from 'chalk';
import sha256 from 'simple-sha256';
import { stdout } from 'stdout-stderr';

import { uuid } from '../../../deps';
import {
  ChangeDefinition,
  DefinitionPlan,
  RequiredAction,
} from '../../../domain';
import { displayPlans } from './displayPlans';

const exampleDefinition = new ChangeDefinition({
  id: uuid(),
  path: '__PATH__',
  sql: '__SQL__',
  hash: sha256.sync('__SQL__'),
});
const applyPlan = new DefinitionPlan({
  id: '__ID__',
  definition: exampleDefinition,
  difference: '__APPLY_DIFFERENCE__',
  action: RequiredAction.APPLY,
});
const noChangePlan = new DefinitionPlan({
  id: '__ID__',
  definition: exampleDefinition,
  difference: '__NO_CHANGE_DIFFERENCE__',
  action: RequiredAction.NO_CHANGE,
});
const reapplyPlan = new DefinitionPlan({
  id: '__ID__',
  definition: exampleDefinition,
  difference: '__REAPPLY_DIFFERENCE__',
  action: RequiredAction.REAPPLY,
});
const manualReapplyPlan = new DefinitionPlan({
  id: '__ID__',
  definition: exampleDefinition,
  difference: '__MANUAL_REAPPLY_DIFFERENCE__',
  action: RequiredAction.MANUAL_REAPPLY,
});
const manualMigrationPlan = new DefinitionPlan({
  id: '__ID__',
  definition: exampleDefinition,
  difference: '__MANUAL_REAPPLY_DIFFERENCE__',
  action: RequiredAction.MANUAL_MIGRATION,
});
const manualPullPlan = new DefinitionPlan({
  id: '__ID__',
  definition: exampleDefinition,
  difference: '__MANUAL_REAPPLY_DIFFERENCE__',
  action: RequiredAction.MANUAL_PULL,
});

const getDisplayPlanOutput = async ({ plan }: { plan: DefinitionPlan }) => {
  stdout.stripColor = false; // dont strip color
  stdout.start();
  await displayPlans({ plans: [plan] });
  stdout.stop();
  const output = stdout.output
    .split('\n')
    .filter((line) => !line.includes('console.log'))
    .join('\n'); // strip the console log portion
  return output;
};
describe('displayPlans', () => {
  it('should display the diff for an APPLY plan', async () => {
    const output = await getDisplayPlanOutput({ plan: applyPlan });
    expect(output).toContain(applyPlan.difference);
  });
  it('should display the diff for a REAPPLY plan', async () => {
    const output = await getDisplayPlanOutput({ plan: reapplyPlan });
    expect(output).toContain(reapplyPlan.difference);
  });
  it('should display the diff for a MANUAL_REAPPLY plan', async () => {
    const output = await getDisplayPlanOutput({ plan: manualReapplyPlan });
    expect(output).toContain(manualReapplyPlan.difference);
  });
  it('should say nothing to do if all plans are no change', async () => {
    const output = await getDisplayPlanOutput({ plan: noChangePlan });
    expect(output).not.toContain(`[${RequiredAction.NO_CHANGE}]`);
    expect(output).toContain('Everything is up to date');
    expect(output).toContain('No actions required');
  });
  it('should color an APPLY plan green', async () => {
    const output = await getDisplayPlanOutput({ plan: applyPlan });
    expect(output).toContain(Chalk.green(`[${RequiredAction.APPLY}]`));
  });
  it('should color a REAPPLY plan yellow', async () => {
    const output = await getDisplayPlanOutput({ plan: reapplyPlan });
    expect(output).toContain(Chalk.yellow(`[${RequiredAction.REAPPLY}]`));
  });
  it('should color a MANUAL_REAPPLY plan red', async () => {
    const output = await getDisplayPlanOutput({ plan: manualReapplyPlan });
    expect(output).toContain(Chalk.red(`[${RequiredAction.MANUAL_REAPPLY}]`));
  });
  it('should color a MANUAL_MIGRATION plan red', async () => {
    const output = await getDisplayPlanOutput({ plan: manualMigrationPlan });
    expect(output).toContain(Chalk.red(`[${RequiredAction.MANUAL_MIGRATION}]`));
  });
  it('should color a MANUAL_PULL plan red', async () => {
    const output = await getDisplayPlanOutput({ plan: manualPullPlan });
    expect(output).toContain(Chalk.red(`[${RequiredAction.MANUAL_PULL}]`));
  });
});
