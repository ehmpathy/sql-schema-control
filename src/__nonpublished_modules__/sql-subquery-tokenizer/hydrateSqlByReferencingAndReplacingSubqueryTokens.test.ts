import { exampleSqlQueryWithSubquery } from './__test_assets__/exampleSqlQueryWithSubquery';
import { flattenSqlByReferencingAndTokenizingSubqueries } from './flattenSqlByReferencingAndTokenizingSubqueries';
import { hydrateSqlByReferencingAndReplacingSubqueryTokens } from './hydrateSqlByReferencingAndReplacingSubqueryTokens';

describe('hydrateSqlByReferencingAndReplacingSubqueryTokens', () => {
  it('should be able to rehydrate what we tokenized', () => {
    const sql = exampleSqlQueryWithSubquery;
    const { flattenedSql, references } =
      flattenSqlByReferencingAndTokenizingSubqueries({ sql });
    const rehydratedSql = hydrateSqlByReferencingAndReplacingSubqueryTokens({
      flattenedSql,
      references,
    });
    expect(rehydratedSql).toEqual(sql);
  });
});
