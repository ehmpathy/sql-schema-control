import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';
import { DatabaseLanguage, DatabaseConnection } from '../constants';
import { ChangeDefinition } from './ChangeDefinition';

const controlContextSchema = Joi.object().keys({
  language: Joi.string().valid(Object.values(DatabaseLanguage)),
  dialect: Joi.string().required(),
  connection: Joi.object().keys({
    query: Joi.func().required(),
    end: Joi.func().required(),
  }),
  definitions: Joi.array().items(ChangeDefinition.schema),
});

interface ControlContextConstructorProps {
  language: DatabaseLanguage;
  dialect: string;
  connection: DatabaseConnection;
  definitions: ChangeDefinition[];
}
export class ControlContext extends SchematicJoiModel<ControlContextConstructorProps> {
  public language!: DatabaseLanguage;
  public dialect!: string;
  public connection!: DatabaseConnection;
  public definitions!: ChangeDefinition[];
  public static schema = controlContextSchema;
}
