import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';
import { ChangeDefinition } from './ChangeDefinition';
import { RequiredAction } from '../constants';

const definitionPlanSchema = Joi.object().keys({
  definition: ChangeDefinition.schema, // TODO: enable using ResourceDefinition too
  difference: Joi.string().optional(), // a human readable string of the difference
  action: Joi.string().valid(Object.values(RequiredAction)), // a key that catogorizes how to display the definition (e.g., color it, bold it, warn about it, throw an error)
});
interface DefinitionPlanConstructorProps {
  definition: ChangeDefinition;
  difference?: string;
  action: RequiredAction;
}
export class DefinitionPlan extends SchematicJoiModel<DefinitionPlanConstructorProps> {
  public definition!: ChangeDefinition;
  public difference?: string;
  public action!: RequiredAction;
  public static schema = definitionPlanSchema;
}
