import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';

import { ResourceType, ResourceDefinitionStatus } from '../constants';

const resourceDefinitionSchema = Joi.object().keys({
  type: Joi.string().valid(Object.values(ResourceType)),
  name: Joi.string().required(),
  sql: Joi.string().required(),
  path: Joi.string().optional(), // not defined for definitions taken from database
  status: Joi.string()
    .valid(Object.values(ResourceDefinitionStatus))
    .optional(),
});

interface ResourceDefinitionConstructorProps {
  type: ResourceType;
  name: string; // e.g., table or sproc name
  sql: string;
  path?: string;
  status?: ResourceDefinitionStatus;
}
export class ResourceDefinition extends SchematicJoiModel<ResourceDefinitionConstructorProps> {
  public type!: ResourceType;
  public name!: string;
  public sql!: string;
  public path?: string;
  public status?: ResourceDefinitionStatus;
  public static schema = resourceDefinitionSchema;
}
