import { ControlContext, ChangeDefinition, ChangeDefinitionStatus } from '../../../../types';

/*
for each definition:
  check if the id is in the database
  - if in the database, check if hash has changed
    - if changed: OUT_OF_DATE
    - if not changed: UP_TO_DATE
  - if not in the database:
    - NOT_APPLIED
*/
export const getChangeStatus = async ({ context, change }: { context: ControlContext, change: ChangeDefinition }) => {
  // 1. get state of change in db
  const [[result]] = await context.connection.query({
    sql: `select * from schema_control_change_log where change_id = '${change.id}'`, // NOTE: we are not concerned with sql injection.
  });

  // 2. determine status based on result
  if (!result) return new ChangeDefinition({ ...change, status: ChangeDefinitionStatus.NOT_APPLIED });
  if (result.change_hash !== change.hash) return new ChangeDefinition({ ...change, status: ChangeDefinitionStatus.OUT_OF_DATE });
  return new ChangeDefinition({ ...change, status: ChangeDefinitionStatus.UP_TO_DATE });
};
