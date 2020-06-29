import { ResourceType } from '../../../../types';
import { normalizeCreateFunctionDdl } from './normalizeCreateDdl/function/normalizeCreateFunctionDdl';
import { normalizeCreateTableDdl } from './normalizeCreateDdl/table/normalizeCreateTableDdl';
import { normalizeCreateViewDdl } from './normalizeCreateDdl/view/normalizeCreateViewDdl';

export const normalizeCreateDdlPostgres = ({
  schema,
  type,
  ddl,
}: {
  schema: string;
  type: ResourceType;
  ddl: string;
}) => {
  // normalize the ddl
  const normalizedDdl = (() => {
    if (type === ResourceType.TABLE) return normalizeCreateTableDdl({ ddl });
    if (type === ResourceType.VIEW) return normalizeCreateViewDdl({ ddl });
    if (type === ResourceType.FUNCTION) return normalizeCreateFunctionDdl({ ddl });
    if (type === ResourceType.PROCEDURE) throw new Error('todo: support show create for procedure');
    throw new Error('unsupported resource type');
  })();

  // strip the ` ${schema}.` qualifier, if the resource is for the same schema that we expect
  return normalizedDdl.replace(` ${schema}.`, ' '); // its implied that it will be for this schema, so no need to include it
};
