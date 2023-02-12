/**
 * strip out all of the parenthesis (since SHOW CREATE adds them everywhere and thats too much to force users to maintain); unideal since it modifies the meaning, but this is only relevant for diffing
 */
export const removeParenthesisFromWhereConditions = ({
  flattenedSql,
}: {
  flattenedSql: string;
}): string => {
  const whereCasing = !!flattenedSql.match(/\sWHERE\s/) ? 'WHERE' : 'where'; // determine if user is using upper case or lower case "where"
  const sqlSplitOnWhere = flattenedSql.split(whereCasing);
  if (sqlSplitOnWhere.length > 2) {
    // should not occur because the sql should have been flattened already
    throw new Error(
      'found more than two parts of DDL after splitting on where; unexpected',
    ); // fail fast
  }
  const sqlWithoutParens =
    sqlSplitOnWhere.length === 2
      ? sqlSplitOnWhere[0]! +
        '\n' +
        whereCasing +
        '\n' +
        sqlSplitOnWhere[1]!.replace(/[\(\)]/g, '') // tslint:disable-line prefer-template
      : sqlSplitOnWhere[0]!; // if no where clause, then nothing to replace
  return sqlWithoutParens;
};
