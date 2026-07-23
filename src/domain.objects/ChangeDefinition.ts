import { DomainObject } from 'domain-objects';
import { z } from 'zod';

import {
  type ChangeDefinitionStatus,
  ChangeDefinitionStatus as ChangeDefinitionStatusEnum,
} from '@src/domain.objects/constants';

const schema = z.object({
  exid: z.string(),
  path: z.string(),
  sql: z.string(),
  hash: z.string(),
  reappliable: z.boolean().optional(),
  status: z.nativeEnum(ChangeDefinitionStatusEnum).optional(),
});

export interface ChangeDefinition {
  exid: string; // the human-authored natural key; ensures file moves preserve hash relationship
  path: string;
  sql: string;
  hash: string;
  reappliable?: boolean; // optional from constructor input, but is defined by the constructor
  status?: ChangeDefinitionStatus;
}
export class ChangeDefinition
  extends DomainObject<ChangeDefinition>
  implements ChangeDefinition
{
  public static schema = schema;
}
