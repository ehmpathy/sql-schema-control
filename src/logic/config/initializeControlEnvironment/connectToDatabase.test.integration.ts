import { promiseConfig } from '../../../_test_assets/connection.config';
import { ControlConfig, DatabaseLanguage } from '../../../types';
import { connectToDatabase } from './connectToDatabase';

describe('connectToDatabase', () => {
  let config: ControlConfig;
  beforeAll(async () => {
    config = new ControlConfig({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: await promiseConfig(),
      definitions: [],
    });
  });
  it('should return a database connection', async () => {
    const connection = await connectToDatabase({ config });
    expect(connection).toHaveProperty('query');
    expect(connection).toHaveProperty('end');
    await connection.end();
  });
  it('should be possible to query the database with the connection', async () => {
    const connection = await connectToDatabase({ config });
    await connection.query({ sql: 'SHOW TABLES' });
    await connection.end();
  });
});
