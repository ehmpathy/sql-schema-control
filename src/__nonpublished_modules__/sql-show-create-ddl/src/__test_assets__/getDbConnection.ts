import { DatabaseLanguage } from '../../../../types';
import { connectToDatabase } from './connectToDatabase';

// the connection config for our integration test dbs, provisioned by docker
export const config = {
  [DatabaseLanguage.MYSQL]: {
    host: 'localhost',
    port: 12821,
    schema: 'superimportantdb',
    username: 'root',
    password: 'a-secure-password',
  },
  [DatabaseLanguage.POSTGRES]: {
    host: 'localhost',
    port: 7821,
    schema: 'superimportantdb',
    username: 'postgres',
    password: 'a-secure-password',
  },
};

export const getDbConnection = async ({ language }: { language: DatabaseLanguage }) =>
  connectToDatabase({ language, config: config[language] });
