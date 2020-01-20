import { getControlContextFromConfig } from '../config/getControlContextFromConfig';
import { getPlans } from './getPlans';
import { displayPlans } from './displayPlans';

export const getAndDisplayPlans = async ({ configPath }: { configPath: string }) => {
  // 1. get the control context
  const context = await getControlContextFromConfig({ configPath });

  // 2. get the plans
  const plans = await getPlans({ context });

  // 3. close the connection
  await context.connection.end();

  // 4. display the plans
  await displayPlans({ plans });
};
