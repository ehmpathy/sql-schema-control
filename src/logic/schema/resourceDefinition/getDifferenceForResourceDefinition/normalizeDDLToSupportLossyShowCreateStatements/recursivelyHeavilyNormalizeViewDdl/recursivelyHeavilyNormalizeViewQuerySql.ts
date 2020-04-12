import {
  flattenSqlByReferencingAndTokenizingSubqueries,
  hydrateSqlByReferencingAndReplacingSubqueryTokens,
} from '../../../../../../__nonpublished_modules__/sql-subquery-tokenizer';
import { removeParenthesisFromWhereConditions } from './normalizations/removeParenthesisFromWhereConditions';
import { removeParenthesisSurroundingJoinsInFromClause } from './normalizations/removeParenthesisSurroundingJoinsInFromClause';
import { removeDoubleParenthesisInJoinOnConditions } from './normalizations/removeDoubleParenthesisInJoinOnConditions';
import { SqlSubqueryReference } from '../../../../../../__nonpublished_modules__/sql-subquery-tokenizer/model/SqlSubqueryReference';
import { removeRedundantAliasDeclarations } from './normalizations/removeRedundantAliasDeclarations';

/**
 * SHOW CREATE drops all user formatting and adds a ton of weird formatting that we dont want any user to have to enforce in order to use views as resources
 *
 * therefore, we heavily normalize it.
 *
 * we also do it recursively, because we support subqueries
 */
export const recursivelyHeavilyNormalizeViewQuerySql = ({ sql }: { sql: string }) => {
  // 1. flatten the ddl by extracting subqueries as referenced tokens
  const { flattenedSql, references } = flattenSqlByReferencingAndTokenizingSubqueries({ sql });

  // 2. normalize the top level flat ddl; hover over the fn's for jsdoc based intellisense explanations for each normalization
  let normalizedFlattenedSql = flattenedSql;
  normalizedFlattenedSql = removeParenthesisFromWhereConditions({ flattenedSql: normalizedFlattenedSql });
  normalizedFlattenedSql = removeDoubleParenthesisInJoinOnConditions({ sql: normalizedFlattenedSql });
  normalizedFlattenedSql = removeParenthesisSurroundingJoinsInFromClause({ flattenedSql: normalizedFlattenedSql });
  normalizedFlattenedSql = removeRedundantAliasDeclarations({ sql: normalizedFlattenedSql });

  // 3. recursively apply this function to each referenced sql and replace the sql in the reference, ready to hydrate back
  const normalizedReferences = references.map((reference) => {
    const referencedSqlWithoutStartEndParen = reference.sql.slice(1, -1); // the flatten function puts subquery inside of parens
    const normalizedReferencedSql = recursivelyHeavilyNormalizeViewQuerySql({ sql: referencedSqlWithoutStartEndParen });
    const normalizedReferencedSqlWithStartEndParens = `(${normalizedReferencedSql})`; // add those parens back
    return new SqlSubqueryReference({ id: reference.id, sql: normalizedReferencedSqlWithStartEndParens });
  });

  // 4. hydrate the references back up
  const hydratedNormalizedSql = hydrateSqlByReferencingAndReplacingSubqueryTokens({
    flattenedSql: normalizedFlattenedSql,
    references: normalizedReferences,
  });

  // 5. return the normalized sql
  return hydratedNormalizedSql;
};
