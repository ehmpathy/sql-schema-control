import { diffStringsUnified } from 'jest-diff';

export const getSqlDifference = ({
  oldSql,
  newSql,
}: {
  oldSql: string;
  newSql: string;
}) => {
  // check strings are not equivalent
  if (oldSql === newSql) return null; // i.e., no difference

  // compute the differences
  const sqlDiffString = diffStringsUnified(oldSql.trim(), newSql.trim());

  // return the diff string
  return sqlDiffString;
};
