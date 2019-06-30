import { ControlContext, ResourceDefinition } from '../../types';
import { getConfig } from './getConfig';
import { initializeControlEnvironment } from './initializeControlEnvironment';
import { getStatus } from '../definitions/getStatus';
import { getUncontrolledResources } from '../definitions/getUncontrolledResources';

/*
  1. get the config (validated and hydrated)
  2. initialize the environment based on the config
    - start the db connection
    - initialize the control environment
  3. return the control context
*/
export const getControlContextFromConfig = async ({ configPath }: { configPath: string }) => {
  // 1. get the config
  const config = await getConfig({ configPath });

  // 2. initialize the environment based on the config
  const { connection } = await initializeControlEnvironment({ config });

  // 3. determine status of each definition
  const definitionsWithStatus = await Promise.all(config.definitions.map(definition => getStatus({ connection, definition })));

  // 4. get uncontroled resources, if strict
  if (config.strict) {
    const controlledResources = definitionsWithStatus.filter(def => def.constructor === ResourceDefinition) as ResourceDefinition[];
    const uncontrolledResources = await getUncontrolledResources({ connection, controlledResources });
    definitionsWithStatus.push(...uncontrolledResources); // append the uncontrolled resources to the definitions with status object
  }

  // 5. return the control context
  return new ControlContext({
    language: config.language,
    dialect: config.dialect,
    connection, // note: the connection is a live dbConnection
    definitions: definitionsWithStatus, // note: we add the status of each definition to the context
  });
};
