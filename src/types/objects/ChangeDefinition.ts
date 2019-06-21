import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';
import { DefinitionType } from '../constants';

const changeDefinitionSchema = Joi.object().keys({
  type: Joi.string().valid([DefinitionType.CHANGE]),
  id: Joi.string().required(),
  sql: Joi.string().required(),
  hash: Joi.string().required().length(64), // sha256 hash
  reappliable: Joi.boolean().required(),
});

interface ChangeDefinitionConstructorProps {
  type: DefinitionType.CHANGE;
  id: string;
  sql: string;
  hash: string;
  reappliable?: boolean; // optional from constructor input, but is defined by the constructor
}
export class ChangeDefinition extends SchematicJoiModel<ChangeDefinitionConstructorProps> {
  constructor(props: ChangeDefinitionConstructorProps) {
    const modifiedProps = { ...props, reappliable: !!props.reappliable };
    super(modifiedProps);
  }
  public type!: DefinitionType.CHANGE;
  public id!: string;
  public sql!: string;
  public hash!: string;
  public reappliable!: boolean;
  public static schema = changeDefinitionSchema;
}
