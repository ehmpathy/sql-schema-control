import { ControlConfig } from '../../../domain';
import { connectToDatabase } from './connectToDatabase';
import { provisionChangeLogTable } from './provisionChangeLogTable';

/*
  complete any actions required to initialize control environment
    1. connect to db
    2. provision change log table
*/
export const initializeControlEnvironment = async ({
  config,
}: {
  config: ControlConfig;
}) => {
  // 1. connect to db
  const connection = await connectToDatabase({ config });

  // 2. provision the change log table
  await provisionChangeLogTable({ connection });

  // 3. return the connection
  return { connection };
};
