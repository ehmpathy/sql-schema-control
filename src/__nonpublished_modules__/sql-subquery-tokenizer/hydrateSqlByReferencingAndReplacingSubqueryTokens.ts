import { SqlSubqueryReference } from './model/SqlSubqueryReference';
import { getTokenForSqlSubqueryReference } from './getTokenForSubqueryReference';

export const hydrateSqlByReferencingAndReplacingSubqueryTokens = ({
  flattenedSql,
  references,
}: {
  flattenedSql: string;
  references: SqlSubqueryReference[];
}) => {
  let hydratedSql = flattenedSql;
  for (const reference of references) {
    const token = getTokenForSqlSubqueryReference({ reference });
    hydratedSql = hydratedSql.replace(token, reference.sql);
  }
  return hydratedSql;
};
