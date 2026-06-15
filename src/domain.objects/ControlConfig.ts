import { DomainObject } from 'domain-objects';
import { z } from 'zod';

import type { ChangeDefinition } from './ChangeDefinition';
import { ChangeDefinition as ChangeDefinitionClass } from './ChangeDefinition';
import type { ConnectionConfig } from './ConnectionConfig';
import { ConnectionConfig as ConnectionConfigClass } from './ConnectionConfig';
import {
  type DatabaseLanguage,
  DatabaseLanguage as DatabaseLanguageEnum,
} from './constants';
import type { ResourceDefinition } from './ResourceDefinition';
import { ResourceDefinition as ResourceDefinitionClass } from './ResourceDefinition';

const schema = z.object({
  language: z.nativeEnum(DatabaseLanguageEnum),
  dialect: z.string(),
  strict: z.boolean(),
  connection: ConnectionConfigClass.schema,
  definitions: z.array(
    z.union([ChangeDefinitionClass.schema, ResourceDefinitionClass.schema]),
  ),
});

type DefinitionObject = ChangeDefinition | ResourceDefinition;
export interface ControlConfig {
  language: DatabaseLanguage;
  dialect: string;
  strict: boolean;
  connection: ConnectionConfig;
  definitions: DefinitionObject[];
}
export class ControlConfig
  extends DomainObject<ControlConfig>
  implements ControlConfig {
  public static schema = schema;
  public static nested = {
    connection: ConnectionConfigClass,
  };
}
