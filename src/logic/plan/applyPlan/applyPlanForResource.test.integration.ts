import { promiseConfig } from '../../../__test_assets__/connection.config';
import {
  ControlConfig,
  DatabaseConnection,
  DatabaseLanguage,
  DefinitionPlan,
  RequiredAction,
  ResourceDefinition,
  ResourceType,
} from '../../../types';
import { initializeControlEnvironment } from '../../config/initializeControlEnvironment';
import { applyPlanForResource } from './applyPlanForResource';

describe('applyPlanForChange', () => {
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
  it('should be able to apply a resource', async () => {
    const resource = new ResourceDefinition({
      path: '__PATH__',
      sql: 'CREATE TABLE some_table_to_test_apply (id BIGINT)',
      type: ResourceType.TABLE,
      name: 'some_table_to_test_apply',
    });
    const plan = new DefinitionPlan({
      id: '__ID__',
      definition: resource,
      difference: '__APPLY_DIFFERENCE__',
      action: RequiredAction.APPLY,
    });

    // 1. ensure db is clean
    await connection.query({ sql: `drop ${resource.type} if exists ${resource.name}` });

    // 2. apply it
    await applyPlanForResource({ connection, plan });

    // 3. check it was applied
    const result = await connection.query({ sql: `SHOW CREATE ${resource.type} ${resource.name}` }); // this will throw error if resource dne
    expect(result.rows[0].Table).toEqual(resource.name);
  });
  it('should be able to reapply a function resource', async () => {
    const resource = new ResourceDefinition({
      path: '__PATH__',
      sql: `
CREATE FUNCTION some_fn_to_test_apply()
RETURNS boolean
BEGIN
  RETURN true;
END;
      `,
      type: ResourceType.FUNCTION,
      name: 'some_fn_to_test_apply',
    });
    const plan = new DefinitionPlan({
      id: '__ID__',
      definition: resource,
      difference: '__APPLY_DIFFERENCE__',
      action: RequiredAction.APPLY,
    });

    // 1. ensure db is clean
    await connection.query({ sql: `drop ${resource.type} if exists ${resource.name}` });

    // 2. apply it
    await applyPlanForResource({ connection, plan });

    // 3. check it was applied
    const result = await connection.query({ sql: 'SELECT some_fn_to_test_apply() as fn_result' }); // this will throw error if resource dne
    expect(result.rows[0].fn_result).toEqual(1);

    // 4. reapply it
    plan.action = RequiredAction.REAPPLY;
    plan.definition.sql = `
CREATE FUNCTION some_fn_to_test_apply()
RETURNS boolean
BEGIN
  RETURN false;
END;
    `;
    await applyPlanForResource({ connection, plan });

    // 5. check it was reapplied
    const resultTwo = await connection.query({ sql: 'SELECT some_fn_to_test_apply() as fn_result' }); // this will throw error if resource dne
    expect(resultTwo.rows[0].fn_result).toEqual(0);
  });
});
