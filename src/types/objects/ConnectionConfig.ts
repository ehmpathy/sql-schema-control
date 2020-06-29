import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';

const connectionConfigSchema = Joi.object().keys({
  host: Joi.string().required(),
  port: Joi.number().required(),
  database: Joi.string().required(),
  schema: Joi.string().optional(), // only pertains to postgres
  username: Joi.string().required(),
  password: Joi.string().required(),
});

interface ConnectionConfigConstructorProps {
  host: string;
  port: number;
  database: string;
  schema?: string;
  username: string;
  password: string;
}
export class ConnectionConfig extends SchematicJoiModel<ConnectionConfigConstructorProps> {
  public host!: string;
  public port!: number;
  public database!: string;
  public schema?: string;
  public username!: string;
  public password!: string;
  public static schema = connectionConfigSchema;
}
