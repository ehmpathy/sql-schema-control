import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';
import { ChangeDefinition } from './ChangeDefinition';
import { ResourceDefinition } from './ResourceDefinition';
import { RequiredAction } from '../constants';

const definitionPlanSchema = Joi.object().keys({
  definition: Joi.alternatives().try([ChangeDefinition.schema, ResourceDefinition.schema]),
  difference: Joi.string().optional(), // a human readable string of the difference
  action: Joi.string().valid(Object.values(RequiredAction)), // a key that catogorizes how to display the definition (e.g., color it, bold it, warn about it, throw an error)
});
interface DefinitionPlanConstructorProps {
  definition: ChangeDefinition | ResourceDefinition;
  difference?: string;
  action: RequiredAction;
}
export class DefinitionPlan extends SchematicJoiModel<DefinitionPlanConstructorProps> {
  public definition!: ChangeDefinition | ResourceDefinition;
  public difference?: string;
  public action!: RequiredAction;
  public static schema = definitionPlanSchema;
}
