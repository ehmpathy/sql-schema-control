import { exampleSqlQueryWithSubquery } from './.test/assets/exampleSqlQueryWithSubquery';
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
