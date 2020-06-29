import { DatabaseLanguage, ResourceType } from '../../../types';
import { normalizeCreateDdlPostgres } from './postgres/normalizeCreateDdlPostgres';
import { normalizeCreateDdlMysql } from './mysql/normalizeCreateDdlMysql';

export const normalizeShowCreateDdl = async ({
  language,
  type,
  ddl,
}: {
  language: DatabaseLanguage;
  type: ResourceType;
  ddl: string;
}) => {
  if (language === DatabaseLanguage.POSTGRES) {
    return normalizeCreateDdlPostgres({ type, ddl });
  }
  if (language === DatabaseLanguage.MYSQL) {
    return normalizeCreateDdlMysql({ type, ddl });
  }
  throw new Error(`database language '${language}' is not supported`);
};
