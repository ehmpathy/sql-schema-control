/**
 * strip out the first and last paren of the "FROM" section, IF it is defined;
 *
 * show create likes to wrap the whole "FROM" section w/ parens... its unreasonable to ask people to do that too.
 */
export const removeParenthesisSurroundingJoinsInFromClause = ({
  flattenedSql,
}: {
  flattenedSql: string;
}) => {
  // check that this sql has this situation going on, if not, do nothing
  const ddlHasParenOpenRightAfterFromClause =
    !!flattenedSql.match(/\sfrom\s+\(/gi); // note, we're not worried about subqueries because we expect flattenedSql as input
  if (!ddlHasParenOpenRightAfterFromClause) return flattenedSql; // do nothing if the situation does not exist

  // split DDL on the from statement, since we know it exists
  const flattenedSqlParts = flattenedSql.split(/\sfrom\s/gi);
  if (flattenedSqlParts.length !== 2)
    throw new Error(
      'not exactly two parts after splitting on from; unexpected',
    ); // fail fast

  // remove the parens that encapsulate each join
  const fromClauseWithoutParens = flattenedSqlParts[1]
    .replace(/\(/g, '')
    .replace(/\)/g, ''); // note: we replace all parens, since subqueries are taken care of

  // join them back and the ddl w/o this mess
  const flattenedSqlWithoutOpenCloseParenInFromClause =
    flattenedSqlParts[0] + '\nfrom\n' + fromClauseWithoutParens; // tslint:disable-line prefer-template

  // return without the parens
  return flattenedSqlWithoutOpenCloseParenInFromClause;
};
