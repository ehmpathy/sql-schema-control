import { DomainObject } from 'domain-objects';
import Joi from 'joi';

import { DatabaseLanguage } from '../constants';
import { ChangeDefinition } from './ChangeDefinition';
import { ConnectionConfig } from './ConnectionConfig';
import { ResourceDefinition } from './ResourceDefinition';

const schema = Joi.object().keys({
  language: Joi.string().valid(...Object.values(DatabaseLanguage)),
  dialect: Joi.string().required(),
  strict: Joi.boolean().required(),
  connection: ConnectionConfig.schema,
  definitions: Joi.array().items(
    ChangeDefinition.schema,
    ResourceDefinition.schema,
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
  implements ControlConfig
{
  public static schema = schema;
}
