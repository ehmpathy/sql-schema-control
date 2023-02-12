import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';

import { DatabaseLanguage, DatabaseConnection } from '../constants';
import { ChangeDefinition } from './ChangeDefinition';
import { ResourceDefinition } from './ResourceDefinition';

const controlContextSchema = Joi.object().keys({
  language: Joi.string().valid(Object.values(DatabaseLanguage)),
  dialect: Joi.string().required(),
  connection: Joi.object().keys({
    query: Joi.func().required(),
    end: Joi.func().required(),
    language: Joi.string().valid(Object.values(DatabaseLanguage)).required(),
    schema: Joi.string().required(),
  }),
  definitions: Joi.array().items(
    ChangeDefinition.schema,
    ResourceDefinition.schema,
  ),
});

type DefinitionObject = ChangeDefinition | ResourceDefinition;
interface ControlContextConstructorProps {
  language: DatabaseLanguage;
  dialect: string;
  connection: DatabaseConnection;
  definitions: DefinitionObject[];
}
export class ControlContext extends SchematicJoiModel<ControlContextConstructorProps> {
  public language!: DatabaseLanguage;
  public dialect!: string;
  public connection!: DatabaseConnection;
  public definitions!: DefinitionObject[];
  public static schema = controlContextSchema;
}
