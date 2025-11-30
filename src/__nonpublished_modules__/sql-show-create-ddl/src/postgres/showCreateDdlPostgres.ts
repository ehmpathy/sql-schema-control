import { ResourceType } from '../../../../domain';
import type { DatabaseConnection } from '../types';
import { normalizeCreateDdlPostgres } from './normalizeCreateDdlPostgres';
import { showCreateFunction } from './showCreateDdl/function/showCreateFunction';
import { showCreateTable } from './showCreateDdl/table/showCreateTable';
import { showCreateView } from './showCreateDdl/view/showCreateView';

export const showCreateDdlPostgres = async ({
  dbConnection,
  type,
  schema,
  name,
}: {
  dbConnection: DatabaseConnection;
  type: ResourceType;
  schema: string;
  name: string;
}): Promise<string> => {
  // grab the ddl
  const ddl = await (async () => {
    if (type === ResourceType.TABLE)
      return showCreateTable({ dbConnection, schema, table: name });
    if (type === ResourceType.VIEW)
      return showCreateView({ dbConnection, schema, name });
    if (type === ResourceType.FUNCTION)
      return showCreateFunction({ dbConnection, schema, func: name });
    if (type === ResourceType.PROCEDURE)
      throw new Error('todo: support show create for procedure'); // todo: support this
    throw new Error('unsupported resource type'); // if none of those, error
  })();

  // normalize it
  return normalizeCreateDdlPostgres({ schema, type, ddl });
};
