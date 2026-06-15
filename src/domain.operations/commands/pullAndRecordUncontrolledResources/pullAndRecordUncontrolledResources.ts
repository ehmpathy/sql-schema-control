import { type ResourceDefinition, ResourceDefinitionStatus } from '@src/domain';
import { getPlans } from '@src/domain.operations/commands/getPlans';
import { getControlContextFromConfig } from '@src/domain.operations/config/getControlContextFromConfig';

import { recordUncontrolledResources } from './recordUncontrolledResources';

/*
  1. get plan (overwriting strict to true, so that we can get uncontrolled resources found)
  2. for each uncontrolled resource definition, record it in the targetPath directory under the standard resource directory structure
*/
export const pullAndRecordUncontrolledResources = async ({
  configPath,
  targetDir,
}: {
  configPath: string;
  targetDir: string;
}) => {
  // 1. get the control context
  const context = await getControlContextFromConfig({
    configPath,
    strict: true,
  }); // overwrite strict to true so that we get uncontrolled resources found

  // 2. get the plans
  const plans = await getPlans({ context });

  // 3. close the connection
  await context.connection.end();

  // 4. record each of the uncontrolled resources into target directory
  const uncontrolledResources = plans
    .map((plan) => plan.definition)
    .filter(
      (def) => def.status === ResourceDefinitionStatus.NOT_CONTROLLED,
    ) as ResourceDefinition[];
  await recordUncontrolledResources({ targetDir, uncontrolledResources });
};
