import { DomainObject } from 'domain-objects';
import Joi from 'joi';

import { ResourceDefinitionStatus, ResourceType } from '../../domain/constants';

const schema = Joi.object().keys({
  type: Joi.string().valid(...Object.values(ResourceType)),
  name: Joi.string().required(),
  sql: Joi.string().required(),
  path: Joi.string().optional(), // not defined for definitions taken from database
  status: Joi.string()
    .valid(...Object.values(ResourceDefinitionStatus))
    .optional(),
});

export interface ResourceDefinition {
  type: ResourceType;
  name: string; // e.g., table or sproc name
  sql: string;
  path?: string;
  status?: ResourceDefinitionStatus;
}
export class ResourceDefinition
  extends DomainObject<ResourceDefinition>
  implements ResourceDefinition
{
  public static schema = schema;
}
