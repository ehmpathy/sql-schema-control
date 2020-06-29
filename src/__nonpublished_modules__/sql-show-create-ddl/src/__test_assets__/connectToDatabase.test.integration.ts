import { DatabaseLanguage } from '../../../../types';
import { connectToDatabase } from './connectToDatabase';
import { config } from './getDbConnection';

describe('connectToDatabase', () => {
  describe('mysql', () => {
    it('should return a database connection', async () => {
      const connection = await connectToDatabase({ language: DatabaseLanguage.MYSQL, config: config.mysql });
      expect(connection).toHaveProperty('query');
      expect(connection).toHaveProperty('end');
      await connection.end();
    });
    it('should be possible to query the database with the connection', async () => {
      const connection = await connectToDatabase({ language: DatabaseLanguage.MYSQL, config: config.mysql });
      await connection.query({ sql: 'SHOW TABLES' });
      await connection.end();
    });
  });
  describe('postgres', () => {
    it('should return a database connection', async () => {
      const connection = await connectToDatabase({ language: DatabaseLanguage.POSTGRES, config: config.postgres });
      expect(connection).toHaveProperty('query');
      expect(connection).toHaveProperty('end');
      await connection.end();
    });
    it('should be possible to query the database with the connection', async () => {
      const connection = await connectToDatabase({ language: DatabaseLanguage.POSTGRES, config: config.postgres });
      await connection.query({ sql: 'SELECT tablename FROM pg_catalog.pg_tables' });
      await connection.end();
    });
  });
});
