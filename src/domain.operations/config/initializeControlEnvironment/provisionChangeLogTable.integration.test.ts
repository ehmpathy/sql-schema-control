import { promiseConfig } from '@src/.test/assets/connection.config';
import {
  ControlConfig,
  type DatabaseConnection,
  DatabaseLanguage,
} from '@src/domain';
import { readFileAsync } from '@src/domain.operations/config/_utils/readFileAsync';

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
        sql: "INSERT INTO schema_control_change_log (change_exid, change_hash, change_content) VALUES ('__EXID__', '__HASH__', '__CONTENT__');",
      });

      // now provision it again and check that we can still find the row
      await provisionChangeLogTable({ connection });
      const { rows } = await connection.query({
        sql: 'select * from schema_control_change_log',
      });
      expect(rows.length).toEqual(1);
      expect(rows[0].change_exid).toEqual('__EXID__');
    });
    it('should migrate a legacy change_id table to change_exid in one provision call (the real prod upgrade path)', async () => {
      // .what = prove provisionChangeLogTable, called ONCE against the real table name that
      //         already holds the legacy change_id column, lands change_exid atomically
      // .why = this is the actual prod upgrade: an extant deploy has schema_control_change_log
      //        with change_id, the new version boots, and provisionChangeLogTable runs
      //        create-if-not-exists (no-op) then the migrate sql in the same call. the temp-table
      //        test proves the sql; this proves the orchestrator drives it on the real table.
      await connection.query({
        sql: 'DROP TABLE IF EXISTS schema_control_change_log',
      });

      // stand up the table with the legacy (pre-rename) change_id schema and seed a row
      await connection.query({
        sql: `
CREATE TABLE schema_control_change_log (
  id              INT(11) PRIMARY KEY AUTO_INCREMENT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
  change_id             VARCHAR(191) NOT NULL,
  change_hash           CHAR(64) NOT NULL,
  change_content        TEXT,
  UNIQUE schema_control_change_log_ux1 (change_id)
) ENGINE = InnoDB;`,
      });
      await connection.query({
        sql: "INSERT INTO schema_control_change_log (change_id, change_hash, change_content) VALUES ('__EXID__', '__HASH__', '__CONTENT__');",
      });

      // one provision call must rename the column and preserve the row
      await provisionChangeLogTable({ connection });
      const { rows } = await connection.query({
        sql: 'SELECT * FROM schema_control_change_log',
      });
      expect(rows.length).toEqual(1);
      expect(rows[0].change_exid).toEqual('__EXID__');
      expect(rows[0].change_id).toEqual(undefined);

      // idempotent: a second provision is a clean no-op on the already-migrated table
      await provisionChangeLogTable({ connection });
      const { rows: rowsAfter } = await connection.query({
        sql: 'SELECT * FROM schema_control_change_log',
      });
      expect(rowsAfter.length).toEqual(1);
      expect(rowsAfter[0].change_exid).toEqual('__EXID__');
    });
    it('should migrate a legacy change_id column to change_exid (the rename branch)', async () => {
      // .what = prove the migration sql actually renames change_id -> change_exid and preserves the row
      // .why = the shared-table tests only exercise the no-op branch (table already has change_exid);
      //        this exercises the real ALTER ... CHANGE branch against an isolated temp table
      //        (the suite runs serially via maxWorkers:1, and the temp table self-cleans)
      const tempTable = 'schema_control_change_log_migtest';
      try {
        // start clean
        await connection.query({ sql: `DROP TABLE IF EXISTS ${tempTable}` });

        // create the table with the legacy schema (change_id, pre-rename)
        await connection.query({
          sql: `
CREATE TABLE ${tempTable} (
  id              INT(11) PRIMARY KEY AUTO_INCREMENT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
  change_id             VARCHAR(191) NOT NULL,
  change_hash           CHAR(64) NOT NULL,
  change_content        TEXT,
  UNIQUE ${tempTable}_ux1 (change_id)
) ENGINE = InnoDB;`,
        });

        // seed a row under the legacy column
        await connection.query({
          sql: `INSERT INTO ${tempTable} (change_id, change_hash, change_content) VALUES ('__EXID__', '__HASH__', '__CONTENT__');`,
        });

        // run the real migration sql, retargeted at the temp table
        const migrationSql = (
          await readFileAsync({
            filePath: `${__dirname}/../../../../schema/tables/schema_control_change_log.migrate_change_id_to_change_exid.mysql.sql`,
          })
        )
          .split('schema_control_change_log')
          .join(tempTable);
        await connection.query({ sql: migrationSql });

        // the column is now change_exid, the value survived, and change_id is gone
        const { rows } = await connection.query({
          sql: `SELECT * FROM ${tempTable}`,
        });
        expect(rows.length).toEqual(1);
        expect(rows[0].change_exid).toEqual('__EXID__');
        expect(rows[0].change_id).toEqual(undefined);

        // idempotent: a second run is a no-op (change_id already gone), not an error
        await connection.query({ sql: migrationSql });
        const { rows: rowsAfter } = await connection.query({
          sql: `SELECT * FROM ${tempTable}`,
        });
        expect(rowsAfter.length).toEqual(1);
        expect(rowsAfter[0].change_exid).toEqual('__EXID__');
      } finally {
        await connection.query({ sql: `DROP TABLE IF EXISTS ${tempTable}` });
      }
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
        sql: "INSERT INTO schema_control_change_log (updated_at, change_exid, change_hash, change_content) VALUES (now(), '__EXID__', '__HASH__', '__CONTENT__');",
      });

      // now provision it again and check that we can still find the row
      await provisionChangeLogTable({ connection });
      const { rows } = await connection.query({
        sql: 'select * from schema_control_change_log',
      });
      expect(rows.length).toEqual(1);
      expect(rows[0].change_exid).toEqual('__EXID__');
    });
    it('should migrate a legacy change_id table to change_exid in one provision call (the real prod upgrade path)', async () => {
      // .what = prove provisionChangeLogTable, called ONCE against the real table name that
      //         already holds the legacy change_id column, lands change_exid atomically
      // .why = this is the actual prod upgrade: an extant deploy has schema_control_change_log
      //        with change_id, the new version boots, and provisionChangeLogTable runs
      //        create-if-not-exists (no-op) then the migrate sql in the same call. the temp-table
      //        test proves the sql; this proves the orchestrator drives it on the real table.
      await connection.query({
        sql: 'DROP TABLE IF EXISTS schema_control_change_log',
      });

      // stand up the table with the legacy (pre-rename) change_id schema and seed a row
      await connection.query({
        sql: `
CREATE TABLE schema_control_change_log (
  id              bigserial,
  created_at      timestamp with time zone default now(),
  updated_at      timestamp with time zone,
  change_id             VARCHAR NOT NULL,
  change_hash           CHAR(64) NOT NULL,
  change_content        TEXT,
  CONSTRAINT schema_control_change_log_pg PRIMARY KEY (id),
  CONSTRAINT schema_control_change_log_ux1 UNIQUE (change_id)
)`,
      });
      await connection.query({
        sql: "INSERT INTO schema_control_change_log (updated_at, change_id, change_hash, change_content) VALUES (now(), '__EXID__', '__HASH__', '__CONTENT__');",
      });

      // one provision call must rename the column and preserve the row
      await provisionChangeLogTable({ connection });
      const { rows } = await connection.query({
        sql: 'SELECT * FROM schema_control_change_log',
      });
      expect(rows.length).toEqual(1);
      expect(rows[0].change_exid).toEqual('__EXID__');
      expect(rows[0].change_id).toEqual(undefined);

      // idempotent: a second provision is a clean no-op on the already-migrated table
      await provisionChangeLogTable({ connection });
      const { rows: rowsAfter } = await connection.query({
        sql: 'SELECT * FROM schema_control_change_log',
      });
      expect(rowsAfter.length).toEqual(1);
      expect(rowsAfter[0].change_exid).toEqual('__EXID__');
    });
    it('should migrate a legacy change_id column to change_exid (the rename branch)', async () => {
      // .what = prove the migration sql actually renames change_id -> change_exid and preserves the row
      // .why = the shared-table tests only exercise the no-op branch (table already has change_exid);
      //        this exercises the real ALTER ... RENAME COLUMN branch against an isolated temp table
      //        (the suite runs serially via maxWorkers:1, and the temp table self-cleans)
      const tempTable = 'schema_control_change_log_migtest';
      try {
        // start clean
        await connection.query({ sql: `DROP TABLE IF EXISTS ${tempTable}` });

        // create the table with the legacy schema (change_id, pre-rename)
        await connection.query({
          sql: `
CREATE TABLE ${tempTable} (
  id              bigserial,
  created_at      timestamp with time zone default now(),
  updated_at      timestamp with time zone,
  change_id             VARCHAR NOT NULL,
  change_hash           CHAR(64) NOT NULL,
  change_content        TEXT,
  CONSTRAINT ${tempTable}_pk PRIMARY KEY (id),
  CONSTRAINT ${tempTable}_ux1 UNIQUE (change_id)
)`,
        });

        // seed a row under the legacy column
        await connection.query({
          sql: `INSERT INTO ${tempTable} (updated_at, change_id, change_hash, change_content) VALUES (now(), '__EXID__', '__HASH__', '__CONTENT__');`,
        });

        // run the real migration sql, retargeted at the temp table
        const migrationSql = (
          await readFileAsync({
            filePath: `${__dirname}/../../../../schema/tables/schema_control_change_log.migrate_change_id_to_change_exid.postgres.sql`,
          })
        )
          .split('schema_control_change_log')
          .join(tempTable);
        await connection.query({ sql: migrationSql });

        // the column is now change_exid, the value survived, and change_id is gone
        const { rows } = await connection.query({
          sql: `SELECT * FROM ${tempTable}`,
        });
        expect(rows.length).toEqual(1);
        expect(rows[0].change_exid).toEqual('__EXID__');
        expect(rows[0].change_id).toEqual(undefined);

        // idempotent: a second run is a no-op (change_id already gone), not an error
        await connection.query({ sql: migrationSql });
        const { rows: rowsAfter } = await connection.query({
          sql: `SELECT * FROM ${tempTable}`,
        });
        expect(rowsAfter.length).toEqual(1);
        expect(rowsAfter[0].change_exid).toEqual('__EXID__');
      } finally {
        await connection.query({ sql: `DROP TABLE IF EXISTS ${tempTable}` });
      }
    });
    it('should migrate only the current schema under a multi-schema search_path', async () => {
      // .what = prove the migration renames the CURRENT schema's table even when a peer schema
      //         already holds change_exid
      // .why = regression for the unqualified information_schema check: this repo supports
      //        multi-schema postgres (SET search_path per connectToDatabase). without the
      //        current_schema() filter, the unscoped NOT EXISTS(change_exid) sees a peer schema's
      //        already-renamed column and silently skips this schema's rename (an unrecoverable
      //        skip, since the exception handler only guards the ALTER, not a wrongly-false IF)
      const schemaMigrated = 'sscmig_migrated'; // peer schema, already on change_exid
      const schemaLegacy = 'sscmig_legacy'; // current schema, still on change_id
      const migrationSql = await readFileAsync({
        filePath: `${__dirname}/../../../../schema/tables/schema_control_change_log.migrate_change_id_to_change_exid.postgres.sql`,
      });
      try {
        // fresh isolated schemas
        await connection.query({
          sql: `DROP SCHEMA IF EXISTS ${schemaMigrated} CASCADE`,
        });
        await connection.query({
          sql: `DROP SCHEMA IF EXISTS ${schemaLegacy} CASCADE`,
        });
        await connection.query({ sql: `CREATE SCHEMA ${schemaMigrated}` });
        await connection.query({ sql: `CREATE SCHEMA ${schemaLegacy}` });

        // the peer schema: table already migrated to change_exid
        await connection.query({
          sql: `CREATE TABLE ${schemaMigrated}.schema_control_change_log ( id bigserial PRIMARY KEY, change_exid VARCHAR NOT NULL, change_hash CHAR(64) NOT NULL, change_content TEXT )`,
        });

        // the current schema: table still on legacy change_id, seeded with a row
        await connection.query({
          sql: `CREATE TABLE ${schemaLegacy}.schema_control_change_log ( id bigserial PRIMARY KEY, change_id VARCHAR NOT NULL, change_hash CHAR(64) NOT NULL, change_content TEXT )`,
        });
        await connection.query({
          sql: `INSERT INTO ${schemaLegacy}.schema_control_change_log (change_id, change_hash, change_content) VALUES ('__EXID__', '__HASH__', '__CONTENT__')`,
        });

        // point the session at the legacy schema and run the real (unqualified) migration
        await connection.query({ sql: `SET search_path TO ${schemaLegacy}` });
        await connection.query({ sql: migrationSql });

        // the legacy schema WAS renamed (not skipped by the peer schema's change_exid)
        const { rows: cols } = await connection.query({
          sql: `SELECT column_name FROM information_schema.columns WHERE table_schema = '${schemaLegacy}' AND table_name = 'schema_control_change_log'`,
        });
        const colNames = cols.map((row: any) => row.column_name);
        expect(colNames).toContain('change_exid');
        expect(colNames).not.toContain('change_id');

        // and the value survived the rename
        const { rows: dataRows } = await connection.query({
          sql: `SELECT change_exid FROM ${schemaLegacy}.schema_control_change_log`,
        });
        expect(dataRows[0].change_exid).toEqual('__EXID__');
      } finally {
        // reset the shared session's search_path, then drop the isolated schemas
        await connection.query({ sql: `SET search_path TO public` });
        await connection.query({
          sql: `DROP SCHEMA IF EXISTS ${schemaMigrated} CASCADE`,
        });
        await connection.query({
          sql: `DROP SCHEMA IF EXISTS ${schemaLegacy} CASCADE`,
        });
      }
    });
  });
});
