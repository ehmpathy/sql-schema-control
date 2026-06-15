import { DomainObject } from 'domain-objects';

export interface SqlSubqueryReference {
  id: string;
  sql: string;
}
export class SqlSubqueryReference
  extends DomainObject<SqlSubqueryReference>
  implements SqlSubqueryReference {}
