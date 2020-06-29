import {
  ControlConfig,
  DatabaseConnection,
  DatabaseLanguage,
  ResourceDefinition,
  ResourceDefinitionStatus,
  ResourceType,
} from '../../../../types';
import { initializeControlEnvironment } from '../../../config/initializeControlEnvironment';
import { getDifferenceForResourceDefinition } from './getDifferenceForResourceDefinition';
import { promiseConfig } from '../../../../__test_assets__/connection.config';

/**
 * note: these are arguably the most important tests - because they define how useful "resources" really are
 *
 * the main advantage of resources is being able to easily see diff between what's checked into version control and whats deployed
 *
 * this is proof that it works
 */
describe('getDifferenceForResourceDefinition', () => {
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
      ({ connection } = await initializeControlEnvironment({ config })); // ensure db is provisioned and get connection
    });
    afterAll(async () => {
      await connection.end();
    });
    describe('table', () => {
      it('should find that an up to date table has no difference', async () => {
        await connection.query({ sql: 'DROP TABLE IF EXISTS some_resource_table' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.TABLE,
          name: 'some_resource_table',
          path: '__PATH__',
          sql: `
CREATE TABLE \`some_resource_table\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `.trim(),
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: definition });
        expect(result).toEqual(null);
      });
      it('should find that an up to date table has no difference, even if auto increment has gone up', async () => {
        await connection.query({ sql: 'DROP TABLE IF EXISTS some_resource_table' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.TABLE,
          name: 'some_resource_table',
          path: '__PATH__',
          sql: `
CREATE TABLE \`some_resource_table\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `.trim(),
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // insert into the table
        await connection.query({ sql: 'INSERT INTO some_resource_table (created_at) VALUES (now(6))' });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: definition });
        expect(result).toEqual(null);
      });
      it('should find that an out of date table resource has a colored diff of changed lines', async () => {
        await connection.query({ sql: 'DROP TABLE IF EXISTS some_resource_table' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.TABLE,
          name: 'some_resource_table',
          path: '__PATH__',
          sql: `
        CREATE TABLE \`some_resource_table\` (
          \`id\` INT(11) AUTO_INCREMENT,
          \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `,
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // update the original definition
        const updatedDefinition = new ResourceDefinition({
          ...definition,
          sql: `
          CREATE TABLE \`some_resource_table\` (
            \`id\` BIGINT AUTO_INCREMENT,
            \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `,
        });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: updatedDefinition });
        expect(typeof result).toEqual('string');
        expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
      });
    });
    describe('procedure', () => {
      it('should find that an up to date procedure has no difference', async () => {
        await connection.query({ sql: 'DROP PROCEDURE IF EXISTS upsert_user_description' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.PROCEDURE,
          name: 'upsert_user_description',
          path: '__PATH__',
          sql: `
CREATE PROCEDURE \`upsert_user_description\`(
  IN in_from_user_id BIGINT
)
BEGIN
  -- just select something, and also include a comment
  SELECT false;
END
      `,
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: definition });
        expect(result).toEqual(null);
      });
      it('should find that an out of date procedure resource has a colored diff of changed lines', async () => {
        await connection.query({ sql: 'DROP PROCEDURE IF EXISTS upsert_user_description' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.PROCEDURE,
          name: 'upsert_user_description',
          path: '__PATH__',
          sql: `
CREATE PROCEDURE upsert_user_description(
  IN in_from_user_id BIGINT
)
BEGIN
  -- just select something, and also include a comment
  SELECT false;
END;
      `,
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // update the original definition
        const updatedDefinition = new ResourceDefinition({
          ...definition,
          sql: `
CREATE PROCEDURE upsert_user_description(
  IN in_from_user_id BIGINT
)
BEGIN
  -- just select something, and also include a comment
  SELECT true;
END
      `,
        });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: updatedDefinition });
        expect(typeof result).toEqual('string');
        expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
      });
    });
    describe('view', () => {
      it('should find that an up to date view has no difference', async () => {
        await connection.query({ sql: 'DROP VIEW IF EXISTS view_spacecraft_current' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.VIEW,
          name: 'view_spacecraft_current',
          path: '__PATH__',
          sql: `
CREATE VIEW view_spacecraft_current AS
SELECT
  'starship 7' as name; -- NOTE: hard coded so we don't have to provision tables; we test this better in the 'normalizeDDLToSupportLossyShowCreateStatements'
      `,
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: definition });
        expect(result).toEqual(null);
      });
      it('should find that an out of date view resource has a colored diff of changed lines', async () => {
        await connection.query({ sql: 'DROP VIEW IF EXISTS view_spacecraft_current' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.VIEW,
          name: 'view_spacecraft_current',
          path: '__PATH__',
          sql: `
CREATE VIEW view_spacecraft_current AS
SELECT
  'starship 7' as name;
      `,
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // update the original definition
        const updatedDefinition = new ResourceDefinition({
          ...definition,
          sql: `
CREATE VIEW view_spacecraft_current AS
SELECT
  'starship 7' as ship_name;
      `,
        });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: updatedDefinition });
        expect(typeof result).toEqual('string');
        expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
      });
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
      ({ connection } = await initializeControlEnvironment({ config })); // ensure db is provisioned and get connection
    });
    afterAll(async () => {
      await connection.end();
    });
    describe('table', () => {
      it('should find that an up to date table has no difference', async () => {
        await connection.query({ sql: 'DROP TABLE IF EXISTS some_resource_table' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.TABLE,
          name: 'some_resource_table',
          path: '__PATH__',
          sql: `
CREATE TABLE some_resource_table (
  id bigserial NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT some_resource_table_pk PRIMARY KEY (id)
);
          `.trim(),
          status: undefined,
        });
        await connection.query({ sql: definition.sql });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: definition });
        expect(result).toEqual(null);
      });
      it('should find that an up to date table has no difference, even if auto increment has gone up', async () => {
        await connection.query({ sql: 'DROP TABLE IF EXISTS some_resource_table' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.TABLE,
          name: 'some_resource_table',
          path: '__PATH__',
          sql: `
CREATE TABLE some_resource_table (
  id bigserial NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT some_resource_table_pk PRIMARY KEY (id)
);
          `.trim(),
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // insert into the table
        await connection.query({ sql: 'INSERT INTO some_resource_table (created_at) VALUES (now())' });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: definition });
        expect(result).toEqual(null);
      });
      it('should find that an out of date table resource has a colored diff of changed lines', async () => {
        await connection.query({ sql: 'DROP TABLE IF EXISTS some_resource_table' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.TABLE,
          name: 'some_resource_table',
          path: '__PATH__',
          sql: `
CREATE TABLE some_resource_table (
  id bigserial NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT some_resource_table_pk PRIMARY KEY (id)
)
          `.trim(),
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // update the original definition
        const updatedDefinition = new ResourceDefinition({
          ...definition,
          sql: `
CREATE TABLE some_resource_table(
  id serial,
  created_at timestamp DEFAULT now(),
  CONSTRAINT some_resource_table_pk PRIMARY KEY (id)
)
          `.trim(),
        });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: updatedDefinition });
        expect(typeof result).toEqual('string');
        expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
      });
    });
    describe('function', () => {
      it('should find that an up to date function has no difference', async () => {
        await connection.query({ sql: 'DROP FUNCTION IF EXISTS upsert_user_description' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.FUNCTION,
          name: 'upsert_user_description',
          path: '__PATH__',
          sql: `
CREATE OR REPLACE FUNCTION upsert_user_description(
  in_from_user_id bigint
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
  BEGIN
    -- just select something, and also include a comment
    SELECT false;
  END;
$$
      `,
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: definition });
        expect(result).toEqual(null);
      });
      it('should find that an out of date function resource has a colored diff of changed lines', async () => {
        await connection.query({ sql: 'DROP FUNCTION IF EXISTS upsert_user_description' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.FUNCTION,
          name: 'upsert_user_description',
          path: '__PATH__',
          sql: `
CREATE OR REPLACE FUNCTION upsert_user_description(
  in_from_user_id bigint
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
  BEGIN
    -- just select something, and also include a comment
    SELECT false;
  END;
$$
      `,
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // update the original definition
        const updatedDefinition = new ResourceDefinition({
          ...definition,
          sql: `
CREATE OR REPLACE FUNCTION upsert_user_description(
  in_from_user_id bigint,
  in_another_arg boolean
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
  BEGIN
    -- just select something, and also include a comment, which we changed here
    SELECT false;
  END;
$$
      `,
        });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: updatedDefinition });
        expect(typeof result).toEqual('string');
        expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
      });
    });
    describe('view', () => {
      it('should find that an up to date view has no difference', async () => {
        await connection.query({ sql: 'DROP VIEW IF EXISTS view_spacecraft_current' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.VIEW,
          name: 'view_spacecraft_current',
          path: '__PATH__',
          sql: `
CREATE OR REPLACE VIEW view_spacecraft_current AS
SELECT
  'starship 7' as name; -- NOTE: hard coded so we don't have to provision tables; we test this better in the 'normalizeDDLToSupportLossyShowCreateStatements'
      `,
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: definition });
        expect(result).toEqual(null);
      });
      it('should find that an out of date view resource has a colored diff of changed lines', async () => {
        await connection.query({ sql: 'DROP VIEW IF EXISTS view_spacecraft_current' });

        // apply the resource
        const definition = new ResourceDefinition({
          type: ResourceType.VIEW,
          name: 'view_spacecraft_current',
          path: '__PATH__',
          sql: `
CREATE OR REPLACE VIEW view_spacecraft_current AS
SELECT
  'starship 7' as name;
      `,
          status: ResourceDefinitionStatus.OUT_OF_SYNC,
        });
        await connection.query({ sql: definition.sql });

        // update the original definition
        const updatedDefinition = new ResourceDefinition({
          ...definition,
          sql: `
CREATE OR REPLACE VIEW view_spacecraft_current AS
SELECT
  'starship 7' as ship_name;
      `,
        });

        // get the diff
        const result = await getDifferenceForResourceDefinition({ connection, resource: updatedDefinition });
        expect(typeof result).toEqual('string');
        expect(result).toMatchSnapshot(); // result is purely visual, so log an example of it
      });
    });
  });
});
