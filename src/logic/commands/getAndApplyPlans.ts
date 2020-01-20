import { getControlContextFromConfig } from '../config/getControlContextFromConfig';
import { getPlans } from './getPlans';
import { applyPlans } from './applyPlans';

export const getAndApplyPlans = async ({ configPath }: { configPath: string }) => {
  // 1. get the control context
  const context = await getControlContextFromConfig({ configPath });

  // 2. get the plans
  const plans = await getPlans({ context });

  // 3. apply the plans
  await applyPlans({ connection: context.connection, plans });

  // 4. close the connection
  await context.connection.end();
};
