import { ChangeDefinition, type DatabaseConnection } from '../../../../domain';

export class ChangeHasNotBeenAppliedError extends Error {
  public changeId: string;
  constructor({
    changeId,
    changePath,
  }: {
    changeId: string;
    changePath: string;
  }) {
    super(`change id:${changeId}:${changePath} has not yet been applied`);
    this.changeId = changeId;
  }
}

export const getAppliedChangeDefinitionFromDatabase = async ({
  connection,
  changeId,
  changePath,
}: {
  connection: DatabaseConnection;
  changeId: string;
  changePath: string;
}) => {
  const {
    rows: [result],
  } = await connection.query({
    sql: `select * from schema_control_change_log where change_id = '${changeId}'`, // NOTE: we are not concerned with sql injection.
  });
  if (!result) throw new ChangeHasNotBeenAppliedError({ changeId, changePath });
  return new ChangeDefinition({
    id: changeId,
    path: changePath,
    hash: result.change_hash,
    sql: result.change_content,
  });
};
