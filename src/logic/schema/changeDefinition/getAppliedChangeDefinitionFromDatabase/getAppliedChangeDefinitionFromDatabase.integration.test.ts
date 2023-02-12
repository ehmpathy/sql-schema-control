import sha256 from 'simple-sha256';

import { promiseConfig } from '../../../../__test_assets__/connection.config';
import { uuid } from '../../../../deps';
import {
  ChangeDefinition,
  ControlConfig,
  DatabaseConnection,
  DatabaseLanguage,
} from '../../../../domain';
import { initializeControlEnvironment } from '../../../config/initializeControlEnvironment';
import {
  ChangeHasNotBeenAppliedError,
  getAppliedChangeDefinitionFromDatabase,
} from './getAppliedChangeDefinitionFromDatabase';

describe('getAppliedChangeDefinitionFromDatabase', () => {
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
    it('should throw an error if the change has not been applied to the database yet', async () => {
      const definition = new ChangeDefinition({
        id: uuid(),
        path: '__PATH__',
        sql: '__SQL__',
        hash: sha256.sync('__SQL__'),
      });
      try {
        await getAppliedChangeDefinitionFromDatabase({
          connection,
          changeId: definition.id,
          changePath: definition.path,
        });
        throw new Error('should not reach here');
      } catch (error) {
        expect(error).toBeInstanceOf(ChangeHasNotBeenAppliedError);
      }
    });
    it('should be able to get hash and sql of previously applied change', async () => {
      const definition = new ChangeDefinition({
        id: uuid(),
        path: '__PATH__',
        sql: '__SQL__',
        hash: sha256.sync('__SQL__'),
      });

      // record that the definition was already applied
      await connection.query({
        sql: `
      INSERT INTO schema_control_change_log
        (change_id, change_hash, change_content)
      VALUES
        ('${definition.id}', '${definition.hash}', '${definition.sql}');
    `,
      });

      // get the definition
      const result = await getAppliedChangeDefinitionFromDatabase({
        connection,
        changeId: definition.id,
        changePath: definition.path,
      });
      expect(result.constructor).toEqual(ChangeDefinition);
      expect(result.hash).toEqual(definition.hash);
      expect(result.sql).toEqual(definition.sql);
    });
  });
  describe('postgres', () => {
    let connection: DatabaseConnection;
    beforeAll(async () => {
      const config = new ControlConfig({
        language: DatabaseLanguage.POSTGRES,
        dialect: '10.7',
        connection: (await promiseConfig()).postgres,
        definitions: [],
        strict: true,
      });
      ({ connection } = await initializeControlEnvironment({ config })); // ensure db is provisioned and get connection
    });
    afterAll(async () => {
      await connection.end();
    });
    it('should throw an error if the change has not been applied to the database yet', async () => {
      const definition = new ChangeDefinition({
        id: uuid(),
        path: '__PATH__',
        sql: '__SQL__',
        hash: sha256.sync('__SQL__'),
      });
      try {
        await getAppliedChangeDefinitionFromDatabase({
          connection,
          changeId: definition.id,
          changePath: definition.path,
        });
        throw new Error('should not reach here');
      } catch (error) {
        expect(error).toBeInstanceOf(ChangeHasNotBeenAppliedError);
      }
    });
    it('should be able to get hash and sql of previously applied change', async () => {
      const definition = new ChangeDefinition({
        id: uuid(),
        path: '__PATH__',
        sql: '__SQL__',
        hash: sha256.sync('__SQL__'),
      });

      // record that the definition was already applied
      await connection.query({
        sql: `
      INSERT INTO schema_control_change_log
        (change_id, change_hash, change_content)
      VALUES
        ('${definition.id}', '${definition.hash}', '${definition.sql}');
    `,
      });

      // get the definition
      const result = await getAppliedChangeDefinitionFromDatabase({
        connection,
        changeId: definition.id,
        changePath: definition.path,
      });
      expect(result.constructor).toEqual(ChangeDefinition);
      expect(result.hash).toEqual(definition.hash);
      expect(result.sql).toEqual(definition.sql);
    });
  });
});
