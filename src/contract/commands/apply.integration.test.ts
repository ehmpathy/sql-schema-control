import { stdout } from 'stdout-stderr';

import {
  DatabaseConnection,
  DatabaseLanguage,
  ControlConfig,
} from '../../domain';
import { initializeControlEnvironment } from '../../logic/config/initializeControlEnvironment';
import { promiseConfig as promiseConfigMysql } from '../__test_assets__/mysql/connection.config';
import { promiseConfig as promiseConfigPostgres } from '../__test_assets__/postgres/connection.config';
import Apply from './apply';

describe('apply', () => {
  describe('mysql', () => {
    let connection: DatabaseConnection;
    beforeAll(async () => {
      const config = new ControlConfig({
        language: DatabaseLanguage.MYSQL,
        dialect: '5.7',
        connection: await promiseConfigMysql(),
        definitions: [],
        strict: false,
      });
      ({ connection } = await initializeControlEnvironment({ config })); // ensure db is provisioned and get connection
    });
    afterAll(async () => {
      await connection.end();
    });
    it('should have an expected appearance when all changes need to be applied', async () => {
      // ensure previous runs dont break this test
      await connection.query({ sql: 'DROP USER IF EXISTS user_name' });
      await connection.query({ sql: 'DROP TABLE IF EXISTS data_source' });
      await connection.query({
        sql: 'DROP TABLE IF EXISTS notification_version',
      });
      await connection.query({ sql: 'DROP TABLE IF EXISTS notification' });
      await connection.query({ sql: 'DROP TABLE IF EXISTS spaceship_cargo' });
      await connection.query({ sql: 'DROP TABLE IF EXISTS spaceship' });
      await connection.query({
        sql: 'DROP VIEW IF EXISTS view_spaceship_with_cargo',
      });
      await connection.query({
        sql: 'DROP FUNCTION IF EXISTS find_message_hash_by_text',
      });
      await connection.query({
        sql: 'DROP PROCEDURE IF EXISTS upsert_message',
      });
      await connection.query({ sql: 'DELETE FROM schema_control_change_log' });

      // run the test
      stdout.stripColor = false; // dont strip color
      // stdout.print = true;
      stdout.start();
      await Apply.run([
        '-c',
        `${__dirname}/../__test_assets__/mysql/control.yml`,
      ]);
      stdout.stop();
      const output = stdout.output
        .split('\n')
        .filter((line) => !line.includes('console.log'))
        .join('\n') // strip the console log portion
        .replace(/\[\d\d:\d\d:\d\d\]/g, ''); // remove all timestamps, since they change over time...
      expect(output).toMatchSnapshot();
    });
    it('should have an expected appearance when all changes need to be reapplied, if possible', async () => {
      // ensure previous runs dont break this test
      await connection.query({ sql: 'DROP USER IF EXISTS user_name' });
      await connection.query({ sql: 'DROP TABLE IF EXISTS data_source' });
      await connection.query({
        sql: 'DROP TABLE IF EXISTS notification_version',
      });
      await connection.query({ sql: 'DROP TABLE IF EXISTS notification' });
      await connection.query({
        sql: 'DROP FUNCTION IF EXISTS find_message_hash_by_text',
      });
      await connection.query({
        sql: 'DROP PROCEDURE IF EXISTS upsert_message',
      });
      await connection.query({ sql: 'DELETE FROM schema_control_change_log' });

      // apply the definitions the first time
      await Apply.run([
        '-c',
        `${__dirname}/../__test_assets__/mysql/control.yml`,
      ]);

      // reapply the definitions
      stdout.stripColor = false; // dont strip color
      // stdout.print = true;
      stdout.start();
      await Apply.run([
        '-c',
        `${__dirname}/../__test_assets__/mysql/control.yml`,
      ]);
      stdout.stop();
      const output = stdout.output
        .split('\n')
        .filter((line) => !line.includes('console.log'))
        .join('\n') // strip the console log portion
        .replace(/\[\d\d:\d\d:\d\d\]/g, ''); // remove all timestamps, since they change over time...
      expect(output).toMatchSnapshot();
    });
  });
  describe('postgres', () => {
    let connection: DatabaseConnection;
    beforeAll(async () => {
      const config = new ControlConfig({
        language: DatabaseLanguage.POSTGRES,
        dialect: '10.7',
        connection: await promiseConfigPostgres(),
        definitions: [],
        strict: false,
      });
      ({ connection } = await initializeControlEnvironment({ config })); // ensure db is provisioned and get connection
    });
    afterAll(async () => {
      await connection.end();
    });
    it('should have an expected appearance when all changes need to be applied', async () => {
      // ensure previous runs dont break this test
      await connection.query({ sql: 'DELETE FROM schema_control_change_log' });
      try {
        await connection.query({ sql: 'DROP OWNED BY service_awesomeness;' });
        await connection.query({ sql: 'DROP USER service_awesomeness;' });
      } catch (error) {
        // do nothing if this throws error; i.e., "IF EXISTS"
      }
      await connection.query({
        sql: 'DROP TABLE IF EXISTS data_source CASCADE',
      });
      await connection.query({ sql: 'DROP TABLE IF EXISTS photo CASCADE' });
      await connection.query({
        sql: 'DROP TABLE IF EXISTS spaceship_cargo CASCADE',
      });
      await connection.query({ sql: 'DROP TABLE IF EXISTS spaceship CASCADE' });
      await connection.query({
        sql: 'DROP VIEW IF EXISTS view_spaceship_with_cargo',
      });
      await connection.query({
        sql: 'DROP FUNCTION IF EXISTS get_answer_to_life',
      });
      await connection.query({ sql: 'DROP FUNCTION IF EXISTS upsert_photo' });

      // run the test
      stdout.stripColor = false; // dont strip color
      // stdout.print = true;
      stdout.start();
      await Apply.run([
        '-c',
        `${__dirname}/../__test_assets__/postgres/control.yml`,
      ]);
      stdout.stop();
      const output = stdout.output
        .split('\n')
        .filter((line) => !line.includes('console.log'))
        .join('\n') // strip the console log portion
        .replace(/\[\d\d:\d\d:\d\d\]/g, ''); // remove all timestamps, since they change over time...
      expect(output).toMatchSnapshot();
    });
    it('should have an expected appearance when all changes need to be reapplied, if possible', async () => {
      // ensure previous runs dont break this test
      await connection.query({ sql: 'DELETE FROM schema_control_change_log' });
      try {
        await connection.query({ sql: 'DROP OWNED BY service_awesomeness;' });
        await connection.query({ sql: 'DROP USER service_awesomeness;' });
      } catch (error) {
        // do nothing if this throws error; i.e., "IF EXISTS"
      }
      await connection.query({
        sql: 'DROP TABLE IF EXISTS data_source CASCADE',
      });
      await connection.query({ sql: 'DROP TABLE IF EXISTS photo CASCADE' });
      await connection.query({
        sql: 'DROP TABLE IF EXISTS spaceship_cargo CASCADE',
      });
      await connection.query({ sql: 'DROP TABLE IF EXISTS spaceship CASCADE' });
      await connection.query({
        sql: 'DROP VIEW IF EXISTS view_spaceship_with_cargo',
      });
      await connection.query({ sql: 'DROP FUNCTION IF EXISTS upsert_photo' });
      await connection.query({
        sql: 'DROP FUNCTION IF EXISTS get_answer_to_life',
      });

      // apply the definitions the first time
      await Apply.run([
        '-c',
        `${__dirname}/../__test_assets__/postgres/control.yml`,
      ]);

      // reapply the definitions
      stdout.stripColor = false; // dont strip color
      // stdout.print = true;
      stdout.start();
      await Apply.run([
        '-c',
        `${__dirname}/../__test_assets__/postgres/control.yml`,
      ]);
      stdout.stop();
      const output = stdout.output
        .split('\n')
        .filter((line) => !line.includes('console.log'))
        .join('\n') // strip the console log portion
        .replace(/\[\d\d:\d\d:\d\d\]/g, ''); // remove all timestamps, since they change over time...
      expect(output).toMatchSnapshot();
    });
  });
});
