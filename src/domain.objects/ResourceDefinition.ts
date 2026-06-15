import { DomainObject } from 'domain-objects';
import { z } from 'zod';

import {
  type ResourceDefinitionStatus,
  ResourceDefinitionStatus as ResourceDefinitionStatusEnum,
  type ResourceType,
  ResourceType as ResourceTypeEnum,
} from '@src/domain.objects/constants';

const schema = z.object({
  type: z.nativeEnum(ResourceTypeEnum),
  name: z.string(),
  sql: z.string(),
  path: z.string().optional(),
  status: z.nativeEnum(ResourceDefinitionStatusEnum).optional(),
});

export interface ResourceDefinition {
  type: ResourceType;
  name: string; // e.g., table or sproc name
  sql: string;
  path?: string; // not defined for definitions from database
  status?: ResourceDefinitionStatus;
}
export class ResourceDefinition
  extends DomainObject<ResourceDefinition>
  implements ResourceDefinition {
  public static schema = schema;
}
