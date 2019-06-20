import { ControlContext } from '../../types';
import { getConfig } from './getConfig';
import { initializeControlEnvironment } from './initializeControlEnvironment';

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

  // 3. return the control context
  return new ControlContext({
    ...config,
    connection, // note: the connection is a live dbConnection
  });
};
