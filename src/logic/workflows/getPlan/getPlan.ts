import { getControlContextFromConfig } from '../../config/getControlContextFromConfig';
import { getDefinitionPlan } from '../../assess/getDefinitionPlan';

/*
  1. get the control context from the config
  2. get status of each definition
  3. get diffs for each OUT_OF_SYNC / OUT_OF_DATE definition (to be more helpful to user)
  4. calculate convinient diff for user to view
*/
export const getPlan = async ({ configPath }: { configPath: string }) => {
  // 1. get the control context
  const context = await getControlContextFromConfig({ configPath });

  // 2. cast each definition into definition plan elements
  const plans = await Promise.all(context.definitions.map(async definition => getDefinitionPlan({ connection: context.connection, definition })));

  // 3. close the connection
  await context.connection.end();

  // 4. return the definition plans
  return plans;
};
