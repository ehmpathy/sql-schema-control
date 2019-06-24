import { ControlContext, ChangeDefinition, ChangeDefinitionStatus, ChangeDefinitionOutOfDateDiff } from '../../../../types';

/*
for the definition:
  - throw error if status is not "out of date"
  - return difference object if status is "out of date"
*/
export const getChangeDifference = async ({ context, change }: { context: ControlContext, change: ChangeDefinition }): Promise<ChangeDefinitionOutOfDateDiff> => {
  // 0. throw an error if change status is not OUT_OF_DATE
  if (change.status !== ChangeDefinitionStatus.OUT_OF_DATE) throw new Error(`change.status must be ${ChangeDefinitionStatus.OUT_OF_DATE} to get diff`);

  // 1. get state of change in db
  const [[result]] = await context.connection.query({
    sql: `select * from schema_control_change_log where change_id = '${change.id}'`,
  });

  // 2. return a diff object
  return new ChangeDefinitionOutOfDateDiff({
    changeDefinition: change,
    hashDiff: {
      database: result.change_hash,
      definition: change.hash,
    },
    sqlDiff: {
      database: result.change_content,
      definition: change.sql,
    },
  });
};
