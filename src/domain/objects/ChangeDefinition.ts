import { DomainObject } from 'domain-objects';
import Joi from 'joi';

import { ChangeDefinitionStatus } from '../../domain/constants';

const schema = Joi.object().keys({
  id: Joi.string().required(),
  path: Joi.string().required(),
  sql: Joi.string().required(),
  hash: Joi.string().required().length(64), // sha256 hash
  reappliable: Joi.boolean().optional().default(false),
  status: Joi.string()
    .valid(...Object.values(ChangeDefinitionStatus))
    .optional(),
});

export interface ChangeDefinition {
  id: string; // id ensures that you can move the file while maintaining the relationship to the hash
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
