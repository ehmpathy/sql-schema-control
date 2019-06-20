import mysql from 'mysql2/promise';
import { DatabaseConnection, DatabaseLanguage, ControlConfig, ConnectionConfig } from '../../../types';

// create the connection to database
const connectionAdapters = {
  [DatabaseLanguage.MYSQL]: async ({ connectionConfig }: { connectionConfig: ConnectionConfig }): Promise<DatabaseConnection> => {
    const connection = await mysql.createConnection({
      host: connectionConfig.host,
      port: connectionConfig.port,
      database: connectionConfig.schema,
      user: connectionConfig.username,
      password: connectionConfig.password,
    });
    return {
      query: async ({ sql, values }: { sql: string, values?: any[] }) => {
        return connection.query(sql, values);
      },
      end: async () => connection.end(),
    };
  },
};

export const connectToDatabase = async ({ config }: { config: ControlConfig }): Promise<DatabaseConnection> => {
  // 1. get the connection adapter for the method
  const getDbConnection = connectionAdapters[config.language];

  // 2. attempt to connect
  const connection = await getDbConnection({ connectionConfig: config.connection });

  // 3. run a test query to check connection
  await connection.query({ sql: 'SHOW TABLES' }); // TODO: make this not mysql specific

  // 4. return the connection
  return connection;
};
