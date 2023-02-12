import { DomainObject } from 'domain-objects';
import Joi from 'joi';

import { RequiredAction } from '../../domain/constants';
import { ChangeDefinition } from './ChangeDefinition';
import { ResourceDefinition } from './ResourceDefinition';

const schema = Joi.object().keys({
  id: Joi.string().required(),
  definition: Joi.alternatives([
    ChangeDefinition.schema,
    ResourceDefinition.schema,
  ]),
  difference: Joi.string().optional(), // a human readable string of the difference
  action: Joi.string().valid(...Object.values(RequiredAction)), // a key that catogorizes how to display the definition (e.g., color it, bold it, warn about it, throw an error)
});
export interface DefinitionPlan {
  id: string;
  definition: ChangeDefinition | ResourceDefinition;
  difference?: string;
  action: RequiredAction;
}
export class DefinitionPlan
  extends DomainObject<DefinitionPlan>
  implements DefinitionPlan
{
  public static schema = schema;
}
