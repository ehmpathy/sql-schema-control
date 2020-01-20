import chalk from 'chalk';
import * as diff from 'diff';

export const getSqlDifference = ({ oldSql, newSql }: { oldSql: string; newSql: string }) => {
  // check strings are not equivalent
  if (oldSql === newSql) return null; // i.e., no difference

  // compute the differences
  const sqlDiffParts = diff.diffTrimmedLines(oldSql, newSql);

  // merge the differences into a string, with color
  const sqlDiffString = sqlDiffParts.reduce((summary, thisPart) => {
    // pick the color
    let chalkMethod = chalk.gray;
    if (thisPart.added) chalkMethod = chalk.green;
    if (thisPart.removed) chalkMethod = chalk.red;

    // append the colored string
    return summary + chalkMethod(thisPart.value);
  }, ''); // tslint:disable-line align

  // return the diff string
  return sqlDiffString;
};
