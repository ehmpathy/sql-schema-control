import { promiseConfig } from '../../../__test_assets__/connection.config';
import { ControlConfig, DatabaseLanguage } from '../../../domain';
import { connectToDatabase } from './connectToDatabase';

describe('connectToDatabase', () => {
  describe('mysql', () => {
    let config: ControlConfig;
    beforeAll(async () => {
      config = new ControlConfig({
        language: DatabaseLanguage.MYSQL,
        dialect: '5.7',
        connection: (await promiseConfig()).mysql,
        definitions: [],
        strict: true,
      });
    });
    it('should return a database connection', async () => {
      const connection = await connectToDatabase({ config });
      expect(connection).toHaveProperty('query');
      expect(connection).toHaveProperty('end');
      await connection.end();
    });
    it('should be possible to query the database with the connection', async () => {
      const connection = await connectToDatabase({ config });
      await connection.query({ sql: 'SHOW TABLES' });
      await connection.end();
    });
  });
  describe('postgres', () => {
    let config: ControlConfig;
    beforeAll(async () => {
      config = new ControlConfig({
        language: DatabaseLanguage.POSTGRES,
        dialect: '10.7',
        connection: (await promiseConfig()).postgres,
        definitions: [],
        strict: true,
      });
    });
    it('should return a database connection', async () => {
      const connection = await connectToDatabase({ config });
      expect(connection).toHaveProperty('query');
      expect(connection).toHaveProperty('end');
      await connection.end();
    });
    it('should be possible to query the database with the connection', async () => {
      const connection = await connectToDatabase({ config });
      await connection.query({
        sql: 'SELECT tablename FROM pg_catalog.pg_tables',
      });
      await connection.end();
    });
    it('should throw an error if the requested schema does not exist in the database', async () => {
      try {
        await connectToDatabase({
          config: {
            ...config,
            connection: { ...config.connection, schema: 'random_name' },
          },
        });
      } catch (error) {
        expect(error.message).toContain(
          "schema 'random_name' does not exist in database 'superimportantdb'",
        );
      }
    });
  });
});
