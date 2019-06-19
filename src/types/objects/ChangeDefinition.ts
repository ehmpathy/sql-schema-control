import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';
import { DefinitionType } from '../constants';

const changeDefinitionSchema = Joi.object().keys({
  type: Joi.string().valid([DefinitionType.CHANGE]),
  id: Joi.string().required(),
  path: Joi.string().required(),
  reappliable: Joi.boolean().optional(),
});

interface ChangeDefinitionConstructorProps {
  type: DefinitionType.CHANGE;
  id: string;
  path: string;
  reappliable?: boolean;
}
export class ChangeDefinition extends SchematicJoiModel<ChangeDefinitionConstructorProps> {
  public type!: DefinitionType.CHANGE;
  public id!: string;
  public path!: string;
  public reappliable?: boolean;
  public static schema = changeDefinitionSchema;
}
