import Joi from 'joi';
import SchematicJoiModel from 'schematic-joi-model';
import { ResourceType, ResourceDefinitionStatus } from '../constants';

const resourceDefinitionSchema = Joi.object().keys({
  type: Joi.string().valid(Object.values(ResourceType)),
  id: Joi.string().required(),
  sql: Joi.string().required(),
  path: Joi.string().optional(), // not defined for definitions taken from database
  status: Joi.string().valid(Object.values(ResourceDefinitionStatus)).optional(),
});

interface ResourceDefinitionConstructorProps {
  type: ResourceType;
  id: string; // id ensures that you can move the file while maintaining the relationship to the hash
  sql: string;
  path?: string;
  status?: ResourceDefinitionStatus;
}
export class ResourceDefinition extends SchematicJoiModel<ResourceDefinitionConstructorProps> {
  public type!: ResourceType;
  public id!: string;
  public sql!: string;
  public path?: string;
  public status?: ResourceDefinitionStatus;
  public static schema = resourceDefinitionSchema;
}
