import {
  flattenSqlByReferencingAndTokenizingSubqueries,
  hydrateSqlByReferencingAndReplacingSubqueryTokens,
} from '../../../../../__nonpublished_modules__/sql-subquery-tokenizer';

// TODO: find a better way of doing this rather than all this ad hock normalization... or atleast refactor this normalization to make it less dependent on previous transformation (maybe split parts into their own fns)
// TODO: support subqueries. right now we are not normalizing them. ideally we would flatten and run normalization on root + all subqueries, and then merge back
export const heavilyNormalizeViewDDL = ({ ddl }: { ddl: string }) => {
  // 0. make all "as" words, except the first, lowercase (for some reason, SHOW CREATE lowercases all tokens EXCEPT `as`, which it explicitly upper cases...)
  const casedAsDdl = ddl
    .replace(/ AS /g, ' as ') // /g to apply to each
    .replace(/ as /, ' AS '); // no /g so only apply to first case

  // 1. lowercase everything in the query, since show create does :upside_down_smiley:
  const casedAsDdlParts = casedAsDdl.split(' AS ');
  const casedDdl = [casedAsDdlParts[0], casedAsDdlParts[1].toLowerCase()].join(' AS ');

  // 2. strip out all of the back ticks. until we have an example where that breaks something, they're just too much to force users to have to maintain
  const ddlWithoutBackticks = casedDdl.replace(/`/g, '');

  // 3. strip out all of the parenthesis (since SHOW CREATE adds them everywhere and thats too much to force users to maintain); unideal since it modifies the meaning, but this is only relevant for diffing
  const { flattenedSql: flattenedDdl, references } = flattenSqlByReferencingAndTokenizingSubqueries({
    sql: ddlWithoutBackticks,
  });
  const whereCasing = !!flattenedDdl.match(/\sWHERE\s/) ? 'WHERE' : 'where'; // determine if user is using upper case or lower case "where"
  const ddlSplitOnWhere = ddlWithoutBackticks.split(whereCasing);
  if (ddlSplitOnWhere.length > 2) {
    throw new Error('found more than two parts of DDL after splitting on where; unexpected'); // fail fast
  }
  const ddlWithoutParens =
    ddlSplitOnWhere.length === 2
      ? ddlSplitOnWhere[0] + '\n' + whereCasing + '\n' + ddlSplitOnWhere[1].replace(/[\(\)]/g, '') // tslint:disable-line prefer-template
      : ddlSplitOnWhere[0]; // if no where clause, then nothing to replace
  const rehydratedDdl = hydrateSqlByReferencingAndReplacingSubqueryTokens({
    flattenedSql: ddlWithoutParens,
    references,
  });
  const ddlWithoutParensInWhereConditions = rehydratedDdl;

  // 4. strip out the "double parenthesis" that SHOW CREATE likes to put on the "join on" statements
  const ddlWithoutDoubleParens = ddlWithoutParensInWhereConditions.replace(/\(\(/g, ' ').replace(/\)\)/g, ' ');

  // 5. strip out the first and last paren of the "FROM" section, IF it is defined; show create likes to wrap the whole "FROM" section w/ parens...
  const ddlHasParenOpenRightAfterFromClause = !!ddlWithoutDoubleParens.match(/\sfrom\s+\(/gi);
  let ddlWithoutParenStartingAndEndingFromClause = ddlWithoutDoubleParens;
  if (ddlHasParenOpenRightAfterFromClause) {
    // flatten the ddl so that we only have one FROM clause
    const { flattenedSql: flattenedDdl, references } = flattenSqlByReferencingAndTokenizingSubqueries({
      sql: ddlWithoutDoubleParens,
    });

    // split DDL on the from statement, since we know it exists
    const flattenedDdlParts = flattenedDdl.split(/\sfrom\s/gi);
    if (flattenedDdlParts.length !== 2) throw new Error('not exactly two parts after splitting on from; unexpected'); // fail fast

    // remove the parens from beginning and end
    const fromClauseWithoutFirstOrLastParens = flattenedDdlParts[1].replace(/^\s*\(/, ' ').replace(/\)\s*$/, ' ');

    // join them back and the ddl w/o this mess
    const flattenedDdlWithoutOpenCloseParenInFromClause =
      flattenedDdlParts[0] + '\nfrom\n' + fromClauseWithoutFirstOrLastParens; // tslint:disable-line prefer-template

    // rehydrate them
    const hydratedDdlWithoutOpenCloseParenInFromClause = hydrateSqlByReferencingAndReplacingSubqueryTokens({
      flattenedSql: flattenedDdlWithoutOpenCloseParenInFromClause,
      references,
    });

    // and set the variable accessible to full fn scope
    ddlWithoutParenStartingAndEndingFromClause = hydratedDdlWithoutOpenCloseParenInFromClause;
  }

  // 6. strip out the final `;` if it exists
  const ddlWithoutFinalSemicolon = ddlWithoutParenStartingAndEndingFromClause.replace(/;/g, '');

  // 7. replace `,(` patterns w/ space in between, since our formatter downstream does not like that
  const ddlWithoutTouchingCommaParen = ddlWithoutFinalSemicolon.replace(/,\(/g, ', (');

  // 8. return that result
  return ddlWithoutTouchingCommaParen;
};
