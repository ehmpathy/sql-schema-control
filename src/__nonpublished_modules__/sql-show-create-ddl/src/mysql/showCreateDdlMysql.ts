import { ResourceType } from '../../../../domain';
import type { DatabaseConnection } from '../types';
import { normalizeCreateDdlMysql } from './normalizeCreateDdlMysql';

const resourceToTitleCase = {
  [ResourceType.TABLE]: 'Table',
  [ResourceType.FUNCTION]: 'Function',
  [ResourceType.PROCEDURE]: 'Procedure',
  [ResourceType.VIEW]: 'View',
};

export const showCreateDdlMysql = async ({
  dbConnection,
  type,
  name,
}: {
  dbConnection: DatabaseConnection;
  type: ResourceType;
  schema: string;
  name: string;
}) => {
  const { rows } = await dbConnection.query({
    sql: `SHOW CREATE ${type} ${name}`,
  });
  const ddl = rows[0][`Create ${resourceToTitleCase[type]}`];
  return normalizeCreateDdlMysql({ type, ddl });
};
