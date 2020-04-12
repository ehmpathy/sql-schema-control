import { addSpacesBetweenCommaParenthesisOccurances } from './normalizations/addSpacesBetweenCommaParenthesisOccurances';
import { lowercaseAllAsTokensExceptFirstOne } from './normalizations/lowercaseAllAsTokensExceptFirstOne';
import { lowercaseEverythingAfterFirstAs } from './normalizations/lowercaseEverythingAfterFirstAs';
import { removeAllBackticks } from './normalizations/removeAllBackticks';
import { removeFinalSemicolon } from './normalizations/removeFinalSemicolon';
import { recursivelyHeavilyNormalizeViewQuerySql } from './recursivelyHeavilyNormalizeViewQuerySql';

/**
 * SHOW CREATE drops all user formatting and adds a ton of weird formatting that we dont want any user to have to enforce in order to use views as resources
 *
 * therefore, we heavily normalize it.
 *
 * we also do it recursively, because we support subqueries
 */
export const recursivelyHeavilyNormalizeViewDdl = ({ ddl }: { ddl: string }) => {
  // 1. normalize the query as a baseline, setting casing on everything
  let normalizedDdl = ddl;
  normalizedDdl = lowercaseAllAsTokensExceptFirstOne({ ddl: normalizedDdl });
  normalizedDdl = lowercaseEverythingAfterFirstAs({ ddl: normalizedDdl });
  normalizedDdl = removeAllBackticks({ ddl: normalizedDdl });
  normalizedDdl = removeFinalSemicolon({ ddl: normalizedDdl });
  normalizedDdl = addSpacesBetweenCommaParenthesisOccurances({ ddl: normalizedDdl });

  // 2. recursively normalize the query body; do so recursively to support the subqueries that may be present
  const ddlParts = normalizedDdl.split(' AS '); // NOTE: there is only one upper case AS, so it splits the sql from the view initial create statement
  const viewCreateHeader = ddlParts[0];
  const viewQuerySql = ddlParts[1];
  const normalizedViewQuerySql = recursivelyHeavilyNormalizeViewQuerySql({ sql: viewQuerySql });
  normalizedDdl = viewCreateHeader + ' AS ' + normalizedViewQuerySql; // tslint:disable-line prefer-template

  // 3. return the results
  return normalizedDdl;
};
