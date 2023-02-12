import { DatabaseLanguage } from '../../../../domain';
import { connectToDatabase } from './connectToDatabase';

// the connection config for our integration test dbs, provisioned by docker
export const config = {
  [DatabaseLanguage.MYSQL]: {
    host: 'localhost',
    port: 12821,
    database: 'superimportantdb',
    username: 'root',
    password: 'a-secure-password',
  },
  [DatabaseLanguage.POSTGRES]: {
    host: 'localhost',
    port: 7821,
    database: 'superimportantdb',
    schema: 'public',
    username: 'postgres',
    password: 'a-secure-password',
  },
};

export const getDbConnection = async ({
  language,
}: {
  language: DatabaseLanguage;
}) => connectToDatabase({ language, config: config[language] });
