import { DomainObject } from 'domain-objects';

import type { ChangeDefinition } from './ChangeDefinition';
import type { DatabaseConnection, DatabaseLanguage } from './constants';
import type { ResourceDefinition } from './ResourceDefinition';

type DefinitionObject = ChangeDefinition | ResourceDefinition;
export interface ControlContext {
  language: DatabaseLanguage;
  dialect: string;
  connection: DatabaseConnection;
  definitions: DefinitionObject[];
}
export class ControlContext
  extends DomainObject<ControlContext>
  implements ControlContext {}
