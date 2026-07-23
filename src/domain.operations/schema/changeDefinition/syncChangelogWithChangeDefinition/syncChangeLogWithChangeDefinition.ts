import { UnexpectedCodePathError } from 'helpful-errors';
import { mysql as prepareMySQL, pg as preparePgSQL } from 'yesql';

import {
  type ChangeDefinition,
  type DatabaseConnection,
  DatabaseLanguage,
} from '@src/domain';

export const syncChangeLogWithChangeDefinition = async ({
  connection,
  definition,
}: {
  connection: DatabaseConnection;
  definition: ChangeDefinition;
}) => {
  // mysql support
  if (connection.language === DatabaseLanguage.MYSQL) {
    return await connection.query(
      prepareMySQL(`
INSERT INTO schema_control_change_log
  (change_exid, change_hash, change_content)
VALUES
  (:change_exid, :change_hash, :change_content)
ON DUPLICATE KEY UPDATE
  change_hash = :change_hash,
  change_content = :change_content;
      `)({
        change_exid: definition.exid,
        change_hash: definition.hash,
        change_content: definition.sql,
      }),
    );
  }

  // postgres support
  if (connection.language === DatabaseLanguage.POSTGRES) {
    const prepared = preparePgSQL(`
INSERT INTO schema_control_change_log
  (change_exid, change_hash, change_content)
VALUES
  (:change_exid, :change_hash, :change_content)
ON CONFLICT (change_exid) DO UPDATE
SET
  updated_at = now(),
  change_hash = excluded.change_hash,
  change_content = excluded.change_content;
      `)({
      change_exid: definition.exid,
      change_hash: definition.hash,
      change_content: definition.sql,
    });
    return await connection.query({
      sql: prepared.text,
      values: prepared.values,
    });
  }

  // if none of the above, throw error
  throw new UnexpectedCodePathError('unsupported database language', {
    language: connection.language,
  });
};
