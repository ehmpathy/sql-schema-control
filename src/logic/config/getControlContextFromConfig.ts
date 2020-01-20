import { ControlContext, ResourceDefinition } from '../../types';
import { getUncontrolledResources } from '../schema/resourceDefinition/getUncontrolledResources';
import { getConfig } from './getConfig';
import { initializeControlEnvironment } from './initializeControlEnvironment';

/*
  1. get the config (validated and hydrated)
  2. initialize the environment based on the config
    - start the db connection
    - initialize the control environment
  3. return the control context
*/
export const getControlContextFromConfig = async ({
  configPath,
  strict = false,
}: {
  configPath: string;
  strict?: boolean;
}) => {
  // 1. get the config
  const config = await getConfig({ configPath });

  // 2. initialize the environment based on the config
  const { connection } = await initializeControlEnvironment({ config });

  // 3. define the definitions such that we can append to them if we want (e.g., if want to add uncontrolled)
  const definitions = [...config.definitions];

  // 4. get uncontrolled resources, if strict
  if (config.strict || strict) {
    const controlledResources = definitions.filter(
      (def) => def.constructor === ResourceDefinition,
    ) as ResourceDefinition[];
    const uncontrolledResources = await getUncontrolledResources({ connection, controlledResources });
    definitions.push(...uncontrolledResources); // append the uncontrolled resources to the definitions
  }

  // 5. return the control context
  return new ControlContext({
    language: config.language,
    dialect: config.dialect,
    connection, // note: the connection is a live dbConnection
    definitions, // note: uncontrolled resources will already have statuses
  });
};
