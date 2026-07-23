import type { DatabaseConnection } from '@src/domain';
import { readFileAsync } from '@src/domain.operations/config/_utils/readFileAsync';

export const provisionChangeLogTable = async ({
  connection,
}: {
  connection: DatabaseConnection;
}) => {
  // create the table if not exists
  const createTableIfNotExistsSql = await readFileAsync({
    filePath: `${__dirname}/../../../../schema/tables/schema_control_change_log.${connection.language}.sql`, // note: uses mysql or postgres version based on language
  });
  await connection.query({ sql: createTableIfNotExistsSql });

  // migrate extant tables: rename the natural-key column change_id -> change_exid (idempotent)
  const migrateChangeIdToChangeExidSql = await readFileAsync({
    filePath: `${__dirname}/../../../../schema/tables/schema_control_change_log.migrate_change_id_to_change_exid.${connection.language}.sql`,
  });
  await connection.query({ sql: migrateChangeIdToChangeExidSql });
};
