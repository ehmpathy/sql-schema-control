import mysql from 'mysql2/promise';
import pg from 'pg';

import {
  DatabaseConnection,
  DatabaseLanguage,
  ControlConfig,
  ConnectionConfig,
} from '../../../types';

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
      database: connectionConfig.database,
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
      schema: connectionConfig.database, // schema = database in mysql
    };
  },
  [DatabaseLanguage.POSTGRES]: async ({
    connectionConfig,
  }: {
    connectionConfig: ConnectionConfig;
  }): Promise<DatabaseConnection> => {
    // check that database is defined
    if (!connectionConfig.database)
      throw new Error('database must be defined for postgres connection'); // its not used for mysql, since they only have a schema concept

    // connect to the db
    const client = new pg.Client({
      host: connectionConfig.host,
      port: connectionConfig.port,
      user: connectionConfig.username,
      password: connectionConfig.password,
      database: connectionConfig.database,
    });
    await client.connect();

    // if schema is defined, setup connection to use it by default
    if (connectionConfig.schema) {
      try {
        // throw an error if the requested schema does not exist in the database
        const { rows } = await client.query(
          `SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${connectionConfig.schema}';`,
        );
        if (!rows.length) {
          throw new Error(
            `schema '${connectionConfig.schema}' does not exist in database '${connectionConfig.database}'.`,
          );
        }

        // specify that all statements are expected to run in the input schema, not public schema
        await client.query(`SET search_path TO ${connectionConfig.schema};`); // https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATH
      } catch (error) {
        await client.end(); // close out the connection since we failed creating it fully
        throw error; // and forward it
      }
    }

    // return a standard api
    return {
      query: async ({
        sql,
        values,
      }: {
        sql: string;
        values?: (string | number)[];
      }) => {
        const result = await client.query(sql, values);
        return { rows: result.rows };
      },
      end: () => client.end(),
      language: DatabaseLanguage.POSTGRES,
      schema: connectionConfig.schema ?? 'public', // defaults to public in postgres
    };
  },
};

export const connectToDatabase = async ({
  config,
}: {
  config: ControlConfig;
}): Promise<DatabaseConnection> => {
  // 1. get the connection adapter for the method
  const getDbConnection = connectionAdapters[config.language];

  // 2. attempt to connect
  const connection = await getDbConnection({
    connectionConfig: config.connection,
  });

  // 3. run a test query to check connection
  await connection.query({ sql: 'SELECT 1' });

  // 4. return the connection
  return connection;
};
