import mysql from 'mysql2/promise';
import pg from 'pg';
import { DatabaseConnection, DatabaseLanguage, ControlConfig, ConnectionConfig } from '../../../types';

// create the connection to database
const connectionAdapters = {
  [DatabaseLanguage.MYSQL]: async ({
    connectionConfig,
  }: {
    connectionConfig: ConnectionConfig;
  }): Promise<DatabaseConnection> => {
    const connection = await mysql.createConnection({
      host: connectionConfig.host,
      port: connectionConfig.port,
      database: connectionConfig.schema,
      user: connectionConfig.username,
      password: connectionConfig.password,
      multipleStatements: true,
    });
    return {
      query: async ({ sql, values }: { sql: string; values?: any[] }) => {
        const result = await connection.query(sql, values);
        return { rows: result[0] }; // standardize the response
      },
      end: async () => connection.end(),
      language: DatabaseLanguage.MYSQL,
    };
  },
  [DatabaseLanguage.POSTGRESQL]: async ({
    connectionConfig,
  }: {
    connectionConfig: ConnectionConfig;
  }): Promise<DatabaseConnection> => {
    const client = new pg.Client({
      host: connectionConfig.host,
      port: connectionConfig.port,
      user: connectionConfig.username,
      password: connectionConfig.password,
      database: connectionConfig.schema,
    });
    await client.connect();
    return {
      query: async ({ sql, values }: { sql: string; values?: (string | number)[] }) => {
        const result = await client.query(sql, values);
        return { rows: result.rows };
      },
      end: () => client.end(),
      language: DatabaseLanguage.POSTGRESQL,
    };
  },
};

export const connectToDatabase = async ({ config }: { config: ControlConfig }): Promise<DatabaseConnection> => {
  // 1. get the connection adapter for the method
  const getDbConnection = connectionAdapters[config.language];

  // 2. attempt to connect
  const connection = await getDbConnection({ connectionConfig: config.connection });

  // 3. run a test query to check connection
  await connection.query({ sql: 'SELECT 1' });

  // 4. return the connection
  return connection;
};
