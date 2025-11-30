import sha256 from 'simple-sha256';

import { promiseConfig } from '../../../../.test/assets/connection.config';
import { uuid } from '../../../../deps';
import {
  ChangeDefinition,
  ControlConfig,
  type DatabaseConnection,
  DatabaseLanguage,
} from '../../../../domain';
import { initializeControlEnvironment } from '../../../config/initializeControlEnvironment';
import { syncChangeLogWithChangeDefinition } from './syncChangeLogWithChangeDefinition';

describe('syncChangeLogWithChangeDefinition', () => {
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
    it('should be able to sync change log for change def that has not been recorded in log yet', async () => {
      const definition = new ChangeDefinition({
        id: uuid(),
        path: '__PATH__',
        sql: "CREATE USER 'edlrdo'@'%';",
        hash: sha256.sync("CREATE USER 'edlrdo'@'%';"),
      });
      await syncChangeLogWithChangeDefinition({ connection, definition });

      // check that the entry was recorded into the changelog accurately
      const { rows: changeLogRows } = await connection.query({
        sql: `select * from schema_control_change_log where change_id='${definition.id}'`,
      });
      expect(changeLogRows.length).toEqual(1);
      expect(changeLogRows[0].change_hash).toEqual(definition.hash);
      expect(changeLogRows[0].change_content).toEqual(definition.sql);
      expect(changeLogRows[0].updated_at).toEqual(null);
    });
    it('should be able to sync change log for change def that was updated', async () => {
      const definition = new ChangeDefinition({
        id: uuid(),
        path: '__PATH__',
        sql: "CREATE USER 'edlrdo'@'%';",
        hash: sha256.sync("CREATE USER 'edlrdo'@'%';"),
      });
      await syncChangeLogWithChangeDefinition({ connection, definition });

      // update it and resync
      definition.sql = 'SELECT true';
      definition.hash = sha256.sync(definition.sql);
      await syncChangeLogWithChangeDefinition({ connection, definition });

      // check that the entry was updated accurately in the changelog
      const { rows: changeLogRows } = await connection.query({
        sql: `select * from schema_control_change_log where change_id='${definition.id}'`,
      });
      expect(changeLogRows.length).toEqual(1);
      expect(changeLogRows[0].change_hash).toEqual(definition.hash);
      expect(changeLogRows[0].change_content).toEqual(definition.sql);
      expect(changeLogRows[0].updated_at).not.toEqual(null);
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
    it('should be able to sync change log for change def that has not been recorded in log yet', async () => {
      const definition = new ChangeDefinition({
        id: uuid(),
        path: '__PATH__',
        sql: "CREATE USER eldrdo WITH PASSWORD 'test_password';",
        hash: sha256.sync("CREATE USER eldrdo WITH PASSWORD 'test_password';"),
      });
      await syncChangeLogWithChangeDefinition({ connection, definition });

      // check that the entry was recorded into the changelog accurately
      const { rows: changeLogRows } = await connection.query({
        sql: `select * from schema_control_change_log where change_id='${definition.id}'`,
      });
      expect(changeLogRows.length).toEqual(1);
      expect(changeLogRows[0].change_hash).toEqual(definition.hash);
      expect(changeLogRows[0].change_content).toEqual(definition.sql);
      expect(changeLogRows[0].updated_at).toEqual(null);
    });
    it('should be able to sync change log for change def that was updated', async () => {
      const definition = new ChangeDefinition({
        id: uuid(),
        path: '__PATH__',
        sql: "CREATE USER eldrdo WITH PASSWORD 'test_password';",
        hash: sha256.sync("CREATE USER eldrdo WITH PASSWORD 'test_password';"),
      });
      await syncChangeLogWithChangeDefinition({ connection, definition });

      // update it and resync
      definition.sql = 'SELECT true';
      definition.hash = sha256.sync(definition.sql);
      await syncChangeLogWithChangeDefinition({ connection, definition });

      // check that the entry was updated accurately in the changelog
      const { rows: changeLogRows } = await connection.query({
        sql: `select * from schema_control_change_log where change_id='${definition.id}'`,
      });
      expect(changeLogRows.length).toEqual(1);
      expect(changeLogRows[0].change_hash).toEqual(definition.hash);
      expect(changeLogRows[0].change_content).toEqual(definition.sql);
      expect(changeLogRows[0].updated_at).not.toEqual(null);
    });
  });
});
