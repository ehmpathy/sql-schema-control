import { ResourceType } from '../../../../types';
import { DatabaseConnection } from '../types';
import { normalizeCreateFunctionDdl } from './normalizeCreateDdl/function/normalizeCreateFunctionDdl';
import { normalizeCreateTableDdl } from './normalizeCreateDdl/table/normalizeCreateTableDdl';
import { normalizeCreateViewDdl } from './normalizeCreateDdl/view/normalizeCreateViewDdl';
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
}) => {
  // support table
  if (type === ResourceType.TABLE) {
    const ddl = await showCreateTable({ dbConnection, schema, table: name });
    return normalizeCreateTableDdl({ ddl }); // return normalized ddl
  }

  // support view
  if (type === ResourceType.VIEW) {
    const ddl = await showCreateView({ dbConnection, schema, name });
    return normalizeCreateViewDdl({ ddl }); // return normalized ddl
  }

  // support function
  if (type === ResourceType.FUNCTION) {
    const ddl = await showCreateFunction({ dbConnection, schema, func: name });
    return normalizeCreateFunctionDdl({ ddl }); // return normalized ddl
  }

  // support procedure
  if (type === ResourceType.PROCEDURE) throw new Error('todo: support show create for procedure');
};
