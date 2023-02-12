import { DomainObject } from 'domain-objects';
import Joi from 'joi';

const connectionConfigSchema = Joi.object().keys({
  host: Joi.string().required(),
  port: Joi.number().required(),
  database: Joi.string().required(),
  schema: Joi.string().optional(), // only pertains to postgres
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export interface ConnectionConfig {
  host: string;
  port: number;
  database: string;
  schema?: string;
  username: string;
  password: string;
}
export class ConnectionConfig
  extends DomainObject<ConnectionConfig>
  implements ConnectionConfig
{
  public static schema = connectionConfigSchema;
}
