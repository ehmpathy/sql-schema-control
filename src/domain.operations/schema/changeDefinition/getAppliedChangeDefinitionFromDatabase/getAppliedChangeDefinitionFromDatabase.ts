import { ChangeDefinition, type DatabaseConnection } from '@src/domain';

export class ChangeHasNotBeenAppliedError extends Error {
  public changeExid: string;
  constructor({
    changeExid,
    changePath,
  }: {
    changeExid: string;
    changePath: string;
  }) {
    super(`change exid:${changeExid}:${changePath} has not yet been applied`);
    this.changeExid = changeExid;
  }
}

export const getAppliedChangeDefinitionFromDatabase = async ({
  connection,
  changeExid,
  changePath,
}: {
  connection: DatabaseConnection;
  changeExid: string;
  changePath: string;
}) => {
  const {
    rows: [result],
  } = await connection.query({
    sql: `select * from schema_control_change_log where change_exid = '${changeExid}'`, // NOTE: we are not concerned with sql injection.
  });
  if (!result)
    throw new ChangeHasNotBeenAppliedError({ changeExid, changePath });
  return new ChangeDefinition({
    exid: changeExid,
    path: changePath,
    hash: result.change_hash,
    sql: result.change_content,
  });
};
