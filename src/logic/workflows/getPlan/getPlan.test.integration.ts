import { promiseConfig } from './_test_assets/connection.config';
import { DatabaseConnection, ControlConfig, DatabaseLanguage, DefinitionPlan } from '../../../types';
import { getPlan } from './getPlan';
import { initializeControlEnvironment } from '../../config/initializeControlEnvironment';

describe('getStatus', () => {
  let connection: DatabaseConnection;
  beforeAll(async () => {
    const config = new ControlConfig({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: await promiseConfig(),
      definitions: [],
    });
    ({ connection } = await initializeControlEnvironment({ config })); // ensure db is provisioned and get connection
  });
  afterAll(async () => {
    await connection.end();
  });
  it('should find that we get a plan successfuly', async () => {
    await connection.query({ sql: 'delete from schema_control_change_log' }); // ensure clean env
    const plan = await getPlan({ configPath: `${__dirname}/_test_assets/control.yml` }); // try to get the results
    expect(plan.length).not.toEqual(0);
    expect(plan[0].constructor).toEqual(DefinitionPlan);
  });
});
