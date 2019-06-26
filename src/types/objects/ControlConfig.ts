import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';
import { DatabaseLanguage } from '../constants';
import { ConnectionConfig } from './ConnectionConfig';
import { ChangeDefinition } from './ChangeDefinition';

const connectionConfigSchema = Joi.object().keys({
  language: Joi.string().valid(Object.values(DatabaseLanguage)),
  dialect: Joi.string().required(),
  connection: ConnectionConfig.schema,
  definitions: Joi.array().items(ChangeDefinition.schema),
});

interface ControlConfigConstructorProps {
  language: DatabaseLanguage;
  dialect: string;
  connection: ConnectionConfig;
  definitions: ChangeDefinition[];
}
export class ControlConfig extends SchematicJoiModel<ControlConfigConstructorProps> {
  public language!: DatabaseLanguage;
  public dialect!: string;
  public connection!: ConnectionConfig;
  public definitions!: ChangeDefinition[];
  public static schema = connectionConfigSchema;
}
