import { DomainObject } from 'domain-objects';
import Joi from 'joi';

import { DatabaseLanguage, DatabaseConnection } from '../constants';
import { ChangeDefinition } from './ChangeDefinition';
import { ResourceDefinition } from './ResourceDefinition';

const schema = Joi.object().keys({
  language: Joi.string().valid(Object.values(DatabaseLanguage)),
  dialect: Joi.string().required(),
  connection: Joi.object().keys({
    query: Joi.func().required(),
    end: Joi.func().required(),
    language: Joi.string().valid(Object.values(DatabaseLanguage)).required(),
    schema: Joi.string().required(),
  }),
  definitions: Joi.array().items(
    ChangeDefinition.schema,
    ResourceDefinition.schema,
  ),
});

type DefinitionObject = ChangeDefinition | ResourceDefinition;
export interface ControlContext {
  language: DatabaseLanguage;
  dialect: string;
  connection: DatabaseConnection;
  definitions: DefinitionObject[];
}
export class ControlContext
  extends DomainObject<ControlContext>
  implements ControlContext
{
  public static schema = schema;
}
