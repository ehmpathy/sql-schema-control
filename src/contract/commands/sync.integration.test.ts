import { stdout } from 'stdout-stderr';

import {
  ControlConfig,
  type DatabaseConnection,
  DatabaseLanguage,
} from '../../domain';
import { initializeControlEnvironment } from '../../logic/config/initializeControlEnvironment';
import { promiseConfig as promiseConfigMysql } from '../.test/assets/mysql/connection.config';
import { promiseConfig as promiseConfigPostgres } from '../.test/assets/postgres/connection.config';
import Sync from './sync';

describe('sync', () => {
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
    it('should have an expected appearance when syncing change log for a change definition', async () => {
      // run the test
      stdout.stripColor = false; // dont strip color
      // stdout.print = true;
      stdout.start();
      await Sync.run([
        '-c',
        `${__dirname}/../.test/assets/mysql/control.yml`,
        '--id',
        'init_service_user',
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
    it('should have an expected appearance when syncing change log for a change definition', async () => {
      // run the test
      stdout.stripColor = false; // dont strip color
      // stdout.print = true;
      stdout.start();
      await Sync.run([
        '-c',
        `${__dirname}/../.test/assets/postgres/control.yml`,
        '--id',
        'init_service_user',
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
