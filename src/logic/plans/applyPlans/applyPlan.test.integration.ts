import uuid from 'uuid/v4';
import sha256 from 'simple-sha256';
import { applyPlan } from './applyPlan';
import { ChangeDefinition, DefinitionPlan, DatabaseConnection, DatabaseLanguage, ControlConfig, DefinitionType, RequiredAction } from '../../../types';
import { promiseConfig } from './_test_assets/connection.config';
import { initializeControlEnvironment } from '../../config/initializeControlEnvironment';

describe('applyChange', () => {
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
  it('should be able to apply a new change', async () => {
    const userName = `user${uuid().split('-').slice(0, 2).join('')}`;
    const plan = new DefinitionPlan({
      definition: new ChangeDefinition({
        id: uuid(),
        type: DefinitionType.CHANGE,
        path: '__PATH__',
        sql: `CREATE USER '${userName}'@'%';`, // creates a new user
        hash: sha256.sync('__SQL__'),
      }),
      difference: '__APPLY_DIFFERENCE__',
      action: RequiredAction.APPLY,
    });
    await applyPlan({ connection, plan });

    // check that the user was created
    const [[{ user_exists: exists }]] = await connection.query({ sql: `SELECT EXISTS(SELECT 1 FROM mysql.user WHERE user = '${userName}') AS user_exists;` });
    expect(exists).toEqual(1);

    // check that the entry was recorded into the changelog accurately
    const [changeLogRows] = await connection.query({ sql: `select * from schema_control_change_log where change_id='${plan.definition.id}'` });
    expect(changeLogRows.length).toEqual(1);
    expect(changeLogRows[0].change_hash).toEqual(plan.definition.hash);
    expect(changeLogRows[0].change_content).toEqual(plan.definition.sql);
    expect(changeLogRows[0].updated_at).toEqual(null);
  });
  it('should be able to reapply a change', async () => {
    const userName = `user${uuid().split('-').slice(0, 2).join('')}`;

    // apply
    const plan = new DefinitionPlan({
      definition: new ChangeDefinition({
        id: uuid(),
        type: DefinitionType.CHANGE,
        path: '__PATH__',
        sql: `CREATE USER '${userName}'@'%';`, // creates a new user
        hash: sha256.sync('__SQL__'),
      }),
      difference: '__APPLY_DIFFERENCE__',
      action: RequiredAction.APPLY,
    });
    await applyPlan({ connection, plan });

    // reapply
    plan.definition.sql = 'SELECT true';
    plan.definition.hash = sha256.sync(plan.definition.sql);
    plan.action = RequiredAction.REAPPLY;
    await applyPlan({ connection, plan });

    // check that the entry was updated accurately in the changelog
    const [changeLogRows] = await connection.query({ sql: `select * from schema_control_change_log where change_id='${plan.definition.id}'` });
    expect(changeLogRows.length).toEqual(1);
    expect(changeLogRows[0].change_hash).toEqual(plan.definition.hash);
    expect(changeLogRows[0].change_content).toEqual(plan.definition.sql);
    expect(changeLogRows[0].updated_at).not.toEqual(null);
  });
});