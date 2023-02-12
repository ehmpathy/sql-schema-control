import Pull from './pull';
import { stdout } from 'stdout-stderr';
import { DatabaseConnection, DatabaseLanguage, ControlConfig } from '../../types';
import { promiseConfig as promiseConfigMysql } from '../__test_assets__/mysql/connection.config';
import { promiseConfig as promiseConfigPostgres } from '../__test_assets__/postgres/connection.config';
import { initializeControlEnvironment } from '../../logic/config/initializeControlEnvironment';

describe('pull', () => {
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
    it('should find uncontrolled resources and be able to pull them when strict=true', async () => {
      // run pull
      stdout.stripColor = false; // dont strip color
      stdout.start();
      await Pull.run([
        '-c',
        `${__dirname}/../__test_assets__/mysql/control.yml`, // note how the config does not need to be strict for this to work
        '-t',
        `${__dirname}/../__test_assets__/mysql/uncontrolled`,
      ]);
      stdout.stop();
      const output = stdout.output
        .split('\n')
        .filter((line) => !line.includes('console.log'))
        .join('\n');
      expect(output).toContain('[PULLED]'); // output should say "recorded"
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
    it('should find uncontrolled resources and be able to pull them when strict=true', async () => {
      // run pull
      stdout.stripColor = false; // dont strip color
      stdout.start();
      await Pull.run([
        '-c',
        `${__dirname}/../__test_assets__/postgres/control.yml`, // note how the config does not need to be strict for this to work
        '-t',
        `${__dirname}/../__test_assets__/postgres/uncontrolled`,
      ]);
      stdout.stop();
      const output = stdout.output
        .split('\n')
        .filter((line) => !line.includes('console.log'))
        .join('\n');
      expect(output).toContain('[PULLED]'); // output should say "recorded"
    });
  });
});
