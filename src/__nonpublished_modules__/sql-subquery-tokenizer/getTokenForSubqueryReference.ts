import { SqlSubqueryReference } from './model/SqlSubqueryReference';

export const getTokenForSqlSubqueryReference = ({ reference }: { reference: SqlSubqueryReference }) =>
  `__SSQ:${reference.id}__`;
