import { DatabaseLanguage, ResourceType } from '../../../types';
import { DatabaseConnection } from './types';
import { showCreateDdlPostgres } from './postgres/showCreateDdlPostgres';
import { showCreateDdlMysql } from './mysql/showCreateDdlMysql';

export const showCreateDdl = async ({
  dbConnection,
  language,
  type,
  schema,
  name,
}: {
  dbConnection: DatabaseConnection;
  language: DatabaseLanguage;
  type: ResourceType;
  schema: string;
  name: string;
}) => {
  if (language === DatabaseLanguage.POSTGRES) return showCreateDdlPostgres({ dbConnection, type, schema, name });
  if (language === DatabaseLanguage.MYSQL) return showCreateDdlMysql({ dbConnection, type, schema, name });
  throw new Error(`database language '${language}' is not supported`);
};
