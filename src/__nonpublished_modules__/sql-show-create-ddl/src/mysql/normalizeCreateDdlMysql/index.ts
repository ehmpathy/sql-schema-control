import { ResourceType } from '../../../../../domain';
import { normalizeDDLToSupportLossyShowCreateStatements } from './normalizeDDLToSupportLossyShowCreateStatements/normalizeDDLToSupportLossyShowCreateStatements';
import { stripIrrelevantContentFromResourceDDL } from './stripIrrelevantContentFromResourceDDL/stripIrrelevantContentFromResourceDDL';

export const normalizeCreateDdlMysql = async ({
  type,
  ddl,
}: {
  type: ResourceType;
  ddl: string;
}) => {
  // TODO: consider refactoring these commands below to be more "per resource" instead of so generic
  const stripedDdl = stripIrrelevantContentFromResourceDDL({
    ddl,
    resourceType: type,
  });
  const normalizedDdl = normalizeDDLToSupportLossyShowCreateStatements({
    ddl: stripedDdl,
    resourceType: type,
  });
  return normalizedDdl;
};
