import { DatabaseConnection } from '../../../types';
import { readFileAsync } from '../_utils/readFileAsync';

export const provisionChangeLogTable = async ({ connection }: { connection: DatabaseConnection }) => {
  // create the table if not exists (sql consideres its existance for us)
  const createTableSql = await readFileAsync({
    filePath: `${__dirname}/../../../../schema/tables/schema_control_change_log.mysql.sql`,
  }); // TODO: make independent of language (mysql currently)
  await connection.query({ sql: createTableSql });
};
