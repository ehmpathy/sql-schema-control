import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';

import { DatabaseLanguage } from '../constants';
import { ChangeDefinition } from './ChangeDefinition';
import { ConnectionConfig } from './ConnectionConfig';
import { ResourceDefinition } from './ResourceDefinition';

const connectionConfigSchema = Joi.object().keys({
  language: Joi.string().valid(Object.values(DatabaseLanguage)),
  dialect: Joi.string().required(),
  strict: Joi.boolean().required(),
  connection: ConnectionConfig.schema,
  definitions: Joi.array().items(
    ChangeDefinition.schema,
    ResourceDefinition.schema,
  ),
});

type DefinitionObject = ChangeDefinition | ResourceDefinition;
interface ControlConfigConstructorProps {
  language: DatabaseLanguage;
  dialect: string;
  strict: boolean;
  connection: ConnectionConfig;
  definitions: DefinitionObject[];
}
export class ControlConfig extends SchematicJoiModel<ControlConfigConstructorProps> {
  public language!: DatabaseLanguage;
  public dialect!: string;
  public strict!: boolean;
  public connection!: ConnectionConfig;
  public definitions!: DefinitionObject[];
  public static schema = connectionConfigSchema;
}
