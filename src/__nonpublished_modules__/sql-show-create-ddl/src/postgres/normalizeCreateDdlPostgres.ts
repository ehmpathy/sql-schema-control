import { ResourceType } from '../../../../types';
import { normalizeCreateFunctionDdl } from './normalizeCreateDdl/function/normalizeCreateFunctionDdl';
import { normalizeCreateTableDdl } from './normalizeCreateDdl/table/normalizeCreateTableDdl';
import { normalizeCreateViewDdl } from './normalizeCreateDdl/view/normalizeCreateViewDdl';

export const normalizeCreateDdlPostgres = async ({ type, ddl }: { type: ResourceType; ddl: string }) => {
  // support table
  if (type === ResourceType.TABLE) {
    return normalizeCreateTableDdl({ ddl });
  }

  // support view
  if (type === ResourceType.VIEW) {
    return normalizeCreateViewDdl({ ddl });
  }

  // support function
  if (type === ResourceType.FUNCTION) {
    return normalizeCreateFunctionDdl({ ddl });
  }

  // support procedure
  if (type === ResourceType.PROCEDURE) throw new Error('todo: support show create for procedure');
};
