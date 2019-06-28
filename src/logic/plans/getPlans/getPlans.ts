import { ControlContext } from '../../../types';
import { getDefinitionPlan } from '../../definitions/getDefinitionPlan';

/*
  1. get the control context from the config
  2. get status of each definition
  3. get diffs for each OUT_OF_SYNC / OUT_OF_DATE definition (to be more helpful to user)
  4. calculate convinient diff for user to view
*/
export const getPlans = async ({ context }: { context: ControlContext }) => {
  // 1. cast each definition into definition plan elements
  const plans = await Promise.all(
    context.definitions.map(async definition => getDefinitionPlan({ connection: context.connection, definition })),
  );

  // 2. return the plan
  return plans;
};
