import { DomainObject } from 'domain-objects';
import Joi from 'joi';

const schema = Joi.object().keys({
  id: Joi.string().required(),
  sql: Joi.string().required(),
});
export interface SqlSubqueryReference {
  id: string;
  sql: string;
}
export class SqlSubqueryReference
  extends DomainObject<SqlSubqueryReference>
  implements SqlSubqueryReference
{
  public static schema = schema;
}
