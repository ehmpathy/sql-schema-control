import { mysql as prepare } from 'yesql';
import { DefinitionPlan, DatabaseConnection, ChangeDefinition } from '../../../types';

/*
  1. run the sql
  3. save the change into change log
*/
export const applyPlanForChange = async ({
  connection,
  plan,
}: {
  connection: DatabaseConnection;
  plan: DefinitionPlan;
}) => {
  // 1. run the sql
  try {
    await connection.query({ sql: plan.definition.sql });
  } catch (error) {
    throw new Error(`Could not apply ${plan.definition.path}: ${error.message}`);
  }

  // 2. upsert that we have applied this change; TODO: adapter pattern to support resources in addition to changes
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
      change_id: (plan.definition as ChangeDefinition).id,
      change_hash: (plan.definition as ChangeDefinition).hash,
      change_content: plan.definition.sql,
    }),
  );
};
