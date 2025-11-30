import {
  ChangeDefinition,
  type DatabaseConnection,
  type DefinitionPlan,
} from '../../../domain';
import { syncChangeLogWithChangeDefinition } from '../../schema/changeDefinition/syncChangelogWithChangeDefinition/syncChangeLogWithChangeDefinition';

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
    throw new Error(
      `Could not apply ${plan.definition.path}: ${error.message}`,
    );
  }

  // 2. upsert that we have applied this change
  if (!(plan.definition instanceof ChangeDefinition))
    throw new Error('this should not occur'); // just sanity check to satisfy typescript
  await syncChangeLogWithChangeDefinition({
    connection,
    definition: plan.definition,
  });
};
