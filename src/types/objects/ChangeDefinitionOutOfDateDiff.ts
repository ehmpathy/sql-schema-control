import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';
import { ChangeDefinition } from './ChangeDefinition';

const differenceSchema = Joi.object().keys({
  definition: Joi.string().required(),
  database: Joi.string().required(),
});
interface Difference {
  definition: string;
  database: string;
}

const changeDefinitionOutOfDateDiffSchema = Joi.object().keys({
  changeDefinition: ChangeDefinition.schema,
  hashDiff: differenceSchema,
  sqlDiff: differenceSchema,
});
interface ChangeDefinitionOutOfDateDiffConstructorProps {
  changeDefinition: ChangeDefinition;
  hashDiff: Difference;
  sqlDiff: Difference;
}
export class ChangeDefinitionOutOfDateDiff extends SchematicJoiModel<ChangeDefinitionOutOfDateDiffConstructorProps> {
  public changeDefinition!: ChangeDefinition;
  public hashDiff!: Difference;
  public sqlDiff!: Difference;
  public static schema = changeDefinitionOutOfDateDiffSchema;
}
