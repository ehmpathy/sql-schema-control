import { promiseConfig } from '../../../__test_assets__/connection.config';
import {
  DatabaseConnection,
  ControlConfig,
  DatabaseLanguage,
} from '../../../domain';
import { connectToDatabase } from './connectToDatabase';
import { provisionChangeLogTable } from './provisionChangeLogTable';

describe('provisionChangeLogTable', () => {
  describe('mysql', () => {
    let connection: DatabaseConnection;
    beforeAll(async () => {
      const config = new ControlConfig({
        language: DatabaseLanguage.MYSQL,
        dialect: '5.7',
        connection: (await promiseConfig()).mysql,
        definitions: [],
        strict: true,
      });
      connection = await connectToDatabase({ config });
    });
    afterAll(async () => {
      await connection.end();
    });
    it('should create the table if it does not exist', async () => {
      await connection.query({
        sql: 'DROP TABLE IF EXISTS schema_control_change_log',
      });
      await provisionChangeLogTable({ connection });
      const { rows: tables } = await connection.query({ sql: 'show tables' });
      const tableNames = tables.map(
        (row: any) => row.Tables_in_superimportantdb,
      );
      expect(tableNames).toContain('schema_control_change_log');
    });
    it('should not empty the table if it does already exist', async () => {
      // create the table and add some data, so that we can tell if it was droped
      await connection.query({
        sql: 'DROP TABLE IF EXISTS schema_control_change_log',
      });
      await provisionChangeLogTable({ connection });
      await connection.query({
        sql: "INSERT INTO schema_control_change_log (change_id, change_hash, change_content) VALUES ('__ID__', '__HASH__', '__CONTENT__');",
      });

      // now provision it again and check that we can still find the row
      await provisionChangeLogTable({ connection });
      const { rows } = await connection.query({
        sql: 'select * from schema_control_change_log',
      });
      expect(rows.length).toEqual(1);
      expect(rows[0].change_id).toEqual('__ID__');
    });
  });
  describe('postgres', () => {
    let connection: DatabaseConnection;
    beforeAll(async () => {
      const config = new ControlConfig({
        language: DatabaseLanguage.POSTGRES,
        dialect: '5.7',
        connection: (await promiseConfig()).postgres,
        definitions: [],
        strict: true,
      });
      connection = await connectToDatabase({ config });
    });
    afterAll(async () => {
      await connection.end();
    });
    it('should create the table if it does not exist', async () => {
      await connection.query({
        sql: 'DROP TABLE IF EXISTS schema_control_change_log',
      });
      await provisionChangeLogTable({ connection });
      const { rows: tables } = await connection.query({
        sql: 'SELECT tablename FROM pg_catalog.pg_tables',
      });
      const tableNames = tables.map((row: any) => row.tablename);
      expect(tableNames).toContain('schema_control_change_log');
    });
    it('should not empty the table if it does already exist', async () => {
      // create the table and add some data, so that we can tell if it was droped
      await connection.query({
        sql: 'DROP TABLE IF EXISTS schema_control_change_log',
      });
      await provisionChangeLogTable({ connection });
      await connection.query({
        sql: "INSERT INTO schema_control_change_log (updated_at, change_id, change_hash, change_content) VALUES (now(), '__ID__', '__HASH__', '__CONTENT__');",
      });

      // now provision it again and check that we can still find the row
      await provisionChangeLogTable({ connection });
      const { rows } = await connection.query({
        sql: 'select * from schema_control_change_log',
      });
      expect(rows.length).toEqual(1);
      expect(rows[0].change_id).toEqual('__ID__');
    });
  });
});
