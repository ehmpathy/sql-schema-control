import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';
import { ChangeDefinitionStatus } from '../constants';

const changeDefinitionSchema = Joi.object().keys({
  id: Joi.string().required(),
  path: Joi.string().required(),
  sql: Joi.string().required(),
  hash: Joi.string().required().length(64), // sha256 hash
  reappliable: Joi.boolean().required(),
  status: Joi.string().valid(Object.values(ChangeDefinitionStatus)).optional(),
});

interface ChangeDefinitionConstructorProps {
  id: string; // id ensures that you can move the file while maintaining the relationship to the hash
  path: string;
  sql: string;
  hash: string;
  reappliable?: boolean; // optional from constructor input, but is defined by the constructor
  status?: ChangeDefinitionStatus;
}
export class ChangeDefinition extends SchematicJoiModel<ChangeDefinitionConstructorProps> {
  constructor(props: ChangeDefinitionConstructorProps) {
    const modifiedProps = { ...props, reappliable: !!props.reappliable };
    super(modifiedProps);
  }
  public id!: string;
  public path!: string;
  public sql!: string;
  public hash!: string;
  public reappliable!: boolean;
  public status?: ChangeDefinitionStatus;
  public static schema = changeDefinitionSchema;
}
