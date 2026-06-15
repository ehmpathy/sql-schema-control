import { DomainObject } from 'domain-objects';
import { z } from 'zod';

const schema = z.object({
  host: z.string(),
  port: z.number(),
  database: z.string(),
  schema: z.string().optional(),
  username: z.string(),
  password: z.string(),
});

export interface ConnectionConfig {
  host: string;
  port: number;
  database: string;
  schema?: string;
  username: string;
  password: string;
}
export class ConnectionConfig
  extends DomainObject<ConnectionConfig>
  implements ConnectionConfig {
  public static schema = schema;
}
