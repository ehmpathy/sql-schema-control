import { mysql as prepare } from 'yesql';

import { DatabaseConnection, ChangeDefinition } from '../../../../types';

export const syncChangeLogWithChangeDefinition = async ({
  connection,
  definition,
}: {
  connection: DatabaseConnection;
  definition: ChangeDefinition;
}) => {
  await connection.query(
    prepare(`
    INSERT INTO schema_control_change_log
      (change_id, change_hash, change_content)
    VALUES
      (:change_id, :change_hash, :change_content)
    ON DUPLICATE KEY UPDATE
      change_hash = :change_hash,
      change_content = :change_content;
  `)({
      change_id: definition.id,
      change_hash: definition.hash,
      change_content: definition.sql,
    }),
  );
};
