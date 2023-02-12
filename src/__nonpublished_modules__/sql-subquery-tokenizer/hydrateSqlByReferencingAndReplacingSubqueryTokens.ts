import { getTokenForSqlSubqueryReference } from './getTokenForSubqueryReference';
import { SqlSubqueryReference } from './model/SqlSubqueryReference';

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
