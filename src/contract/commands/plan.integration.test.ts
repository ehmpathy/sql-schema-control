import { stdout } from 'stdout-stderr';

import {
  DatabaseConnection,
  DatabaseLanguage,
  ControlConfig,
} from '../../domain';
import { initializeControlEnvironment } from '../../logic/config/initializeControlEnvironment';
import { promiseConfig as promiseConfigMysql } from '../__test_assets__/mysql/connection.config';
import { promiseConfig as promiseConfigPostgres } from '../__test_assets__/postgres/connection.config';
import Plan from './plan';

describe('plan', () => {
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
      await connection.query({ sql: 'DELETE FROM schema_control_change_log' });
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

      // run plan
      stdout.stripColor = false; // dont strip color
      stdout.start();
      await Plan.run([
        '-c',
        `${__dirname}/../__test_assets__/mysql/control.yml`,
      ]);
      stdout.stop();
      const output = stdout.output
        .split('\n')
        .filter((line) => !line.includes('console.log'))
        .join('\n');
      expect(output).toMatchSnapshot();
    });
    it('should have an expected appearance when some resources need to be reapplied manually or automatically', async () => {
      // ensure previous runs dont break this test
      await connection.query({ sql: 'DELETE FROM schema_control_change_log' });
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

      // pre-provision two of the resources with different def (one reappliable, one not)
      const findMessageHashByTextAltSql = `
CREATE FUNCTION find_message_hash_by_text(
  in_message TEXT
)
RETURNS CHAR(64)
BEGIN
  RETURN SHA2(in_message, 256);
END;
    `.trim();
      await connection.query({ sql: findMessageHashByTextAltSql });
      const notificationVersionTableAltSql = `
CREATE TABLE notification_version (
  -- meta
  notification_id BIGINT NOT NULL, -- fk pointing to static entity
  effective_at DATETIME(3) NOT NULL, -- the user should define the effective_at timestamp
  PRIMARY KEY (notification_id, effective_at)
) ENGINE = InnoDB;
    `.trim();
      await connection.query({ sql: notificationVersionTableAltSql });

      // run plan
      stdout.stripColor = false; // dont strip color
      stdout.start();
      await Plan.run([
        '-c',
        `${__dirname}/../__test_assets__/mysql/control.yml`,
      ]);
      stdout.stop();
      const output = stdout.output
        .split('\n')
        .filter((line) => !line.includes('console.log'))
        .join('\n');
      expect(output).toMatchSnapshot();
    });
    it('should find uncontrolled resources when strict=true', async () => {
      // ensure previous runs dont break this test
      await connection.query({ sql: 'DELETE FROM schema_control_change_log' });
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

      // create an uncontrolled resource
      await connection.query({
        sql: "CREATE OR REPLACE VIEW some_uncontrolled_resource AS select 'dont bring me down' as mantra",
      });

      // run plan
      stdout.stripColor = false; // dont strip color
      stdout.start();
      await Plan.run([
        '-c',
        `${__dirname}/../__test_assets__/mysql/strict_control.yml`,
      ]); // separate schema since we don't want snapshot to break due to uncontrolled
      stdout.stop();
      const output = stdout.output
        .split('\n')
        .filter((line) => !line.includes('console.log'))
        .join('\n');
      expect(output).toContain('[MANUAL_PULL]');
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

      // run plan
      stdout.stripColor = false; // dont strip color
      stdout.start();
      await Plan.run([
        '-c',
        `${__dirname}/../__test_assets__/postgres/control.yml`,
      ]);
      stdout.stop();
      const output = stdout.output
        .split('\n')
        .filter((line) => !line.includes('console.log'))
        .join('\n');
      expect(output).toMatchSnapshot();
    });
    it('should have an expected appearance when some resources need to be reapplied manually or automatically', async () => {
      // ensure previous runs dont break this test
      await connection.query({ sql: 'DELETE FROM schema_control_change_log' });
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

      // pre-provision two of the resources with different def (one reappliable, one not)
      const getAnswerToLifeAltSql = `
CREATE OR REPLACE FUNCTION get_answer_to_life()
RETURNS int
LANGUAGE plpgsql
AS $$
  BEGIN
    RETURN 42;
  END;
$$
    `.trim();
      await connection.query({ sql: getAnswerToLifeAltSql });
      const photoAltSql = `
CREATE TABLE photo (
  id bigserial NOT NULL,
  uuid uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  url varchar NOT NULL,
  CONSTRAINT photo_pk PRIMARY KEY (id)
);
    `.trim();
      await connection.query({ sql: photoAltSql });

      // run plan
      stdout.stripColor = false; // dont strip color
      stdout.start();
      await Plan.run([
        '-c',
        `${__dirname}/../__test_assets__/postgres/control.yml`,
      ]);
      stdout.stop();
      const output = stdout.output
        .split('\n')
        .filter((line) => !line.includes('console.log'))
        .join('\n');
      expect(output).toMatchSnapshot();
    });
    it('should find uncontrolled resources when strict=true', async () => {
      // ensure previous runs dont break this test
      await connection.query({ sql: 'DELETE FROM schema_control_change_log' });
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

      // create an uncontrolled resource
      await connection.query({
        sql: "CREATE OR REPLACE VIEW some_uncontrolled_resource AS select 'dont bring me down' as mantra",
      });

      // run plan
      stdout.stripColor = false; // dont strip color
      stdout.start();
      await Plan.run([
        '-c',
        `${__dirname}/../__test_assets__/postgres/strict_control.yml`,
      ]); // separate schema since we don't want snapshot to break due to uncontrolled
      stdout.stop();
      const output = stdout.output
        .split('\n')
        .filter((line) => !line.includes('console.log'))
        .join('\n');
      expect(output).toContain('[MANUAL_PULL]');
    });
  });
});
