import { DomainObject } from 'domain-objects';
import { z } from 'zod';

import {
  type RequiredAction,
  RequiredAction as RequiredActionEnum,
} from '@src/domain.objects/constants';

import type { ChangeDefinition } from './ChangeDefinition';
import { ChangeDefinition as ChangeDefinitionClass } from './ChangeDefinition';
import type { ResourceDefinition } from './ResourceDefinition';
import { ResourceDefinition as ResourceDefinitionClass } from './ResourceDefinition';

const schema = z.object({
  id: z.string(),
  definition: z.union([
    ChangeDefinitionClass.schema,
    ResourceDefinitionClass.schema,
  ]),
  difference: z.string().optional(),
  action: z.nativeEnum(RequiredActionEnum),
});

export interface DefinitionPlan {
  id: string;
  definition: ChangeDefinition | ResourceDefinition;
  difference?: string; // human readable diff
  action: RequiredAction; // display category (e.g., color it, bold it, warn, error)
}
export class DefinitionPlan
  extends DomainObject<DefinitionPlan>
  implements DefinitionPlan
{
  public static schema = schema;
}
