import { DatabaseConnection } from '../../../types';
import { readFileAsync } from '../_utils/readFileAsync';

export const provisionChangeLogTable = async ({ connection }: { connection: DatabaseConnection }) => {
  // create the table if not exists
  const createTableIfNotExistsSql = await readFileAsync({
    filePath: `${__dirname}/../../../../schema/tables/schema_control_change_log.${connection.language}.sql`, // note: uses mysql or postgres version based on language
  });
  await connection.query({ sql: createTableIfNotExistsSql });
};
