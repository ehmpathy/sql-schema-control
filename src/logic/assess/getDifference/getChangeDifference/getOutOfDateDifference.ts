import chalk from 'chalk';
import * as diff from 'diff';
import { DatabaseConnection, ChangeDefinition, ChangeDefinitionStatus } from '../../../../types';

/*
for the definition:
  - throw error if status is not "out of date"
  - return difference object if status is "out of date"
*/
export const getOutOfDateDifference = async ({ connection, change }: { connection: DatabaseConnection, change: ChangeDefinition }) => {
  // 0. throw an error if change status is not OUT_OF_DATE
  if (change.status !== ChangeDefinitionStatus.OUT_OF_DATE) throw new Error(`change.status must be ${ChangeDefinitionStatus.OUT_OF_DATE} to get diff`);

  // 1. get state of change in db
  const [[result]] = await connection.query({
    sql: `select * from schema_control_change_log where change_id = '${change.id}'`,
  });

  // 2. diff object
  const differences = {
    hashDiff: {
      database: result.change_hash,
      definition: change.hash,
    },
    sqlDiff: {
      database: result.change_content,
      definition: change.sql,
    },
  };

  // 3. cast into string
  const sqlDiffParts = diff.diffTrimmedLines(differences.sqlDiff.database, differences.sqlDiff.definition);
  const sqlDiffString = sqlDiffParts.reduce((summary, thisPart) => {
    // pick the color
    let chalkMethod = chalk.gray;
    if (thisPart.added) chalkMethod = chalk.green;
    if (thisPart.removed) chalkMethod = chalk.red;

    // append the colored string
    return summary + chalkMethod(thisPart.value);
  }, ''); // tslint:disable-line align

  // 4. return the diff string
  return sqlDiffString;
};
