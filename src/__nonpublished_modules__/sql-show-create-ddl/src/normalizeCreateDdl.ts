import { DatabaseLanguage, ResourceType } from '../../../domain';
import { normalizeCreateDdlMysql } from './mysql/normalizeCreateDdlMysql';
import { normalizeCreateDdlPostgres } from './postgres/normalizeCreateDdlPostgres';

export const normalizeShowCreateDdl = async ({
  language,
  schema,
  type,
  ddl,
}: {
  language: DatabaseLanguage;
  schema: string;
  type: ResourceType;
  ddl: string;
}): Promise<string> => {
  if (language === DatabaseLanguage.POSTGRES) {
    return normalizeCreateDdlPostgres({ schema, type, ddl });
  }
  if (language === DatabaseLanguage.MYSQL) {
    return normalizeCreateDdlMysql({ type, ddl });
  }
  throw new Error(`database language '${language}' is not supported`);
};
