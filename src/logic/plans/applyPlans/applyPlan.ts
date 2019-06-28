import { mysql as prepare } from 'yesql';
import { RequiredAction, DefinitionPlan, DatabaseConnection } from '../../../types';

/*
  1. throw error if RequiredAction is not APPLY or REAPPLY
  2. run the sql
  3. save the change into change log
*/
export const applyPlan = async ({ connection, plan }: { connection: DatabaseConnection, plan: DefinitionPlan }) => {
  // 1. throw an error if required action is not apply or reapply
  if (![RequiredAction.APPLY, RequiredAction.REAPPLY].includes(plan.action)) throw new Error(`plan.action must be ${RequiredAction.APPLY} or ${RequiredAction.REAPPLY}. Got ${plan.action}`);

  // 2. run the sql
  try {
    await connection.query({ sql: plan.definition.sql });
  } catch (error) {
    throw new Error(`Could not apply ${plan.definition.path}: ${error.message}`);
  }

  // 3. upsert that we have applied this change; TODO: adapter pattern to support resources in addition to changes
  await connection.query(prepare(`
    INSERT INTO schema_control_change_log
      (change_id, change_hash, change_content)
    VALUES
      (:change_id, :change_hash, :change_content)
    ON DUPLICATE KEY UPDATE
      change_hash = :change_hash,
      change_content = :change_content;
  `)({
    change_id: plan.definition.id,
    change_hash: plan.definition.hash,
    change_content: plan.definition.sql,
  }));
};
