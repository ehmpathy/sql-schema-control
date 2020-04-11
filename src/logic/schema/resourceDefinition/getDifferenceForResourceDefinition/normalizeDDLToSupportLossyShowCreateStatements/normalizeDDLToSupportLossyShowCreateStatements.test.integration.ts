import { promiseConfig } from '../../../../../contract/__test_assets__/connection.config';
import { ControlConfig, DatabaseConnection, DatabaseLanguage, ResourceType } from '../../../../../types';
import { initializeControlEnvironment } from '../../../../config/initializeControlEnvironment';
import { getLiveResourceDefinitionFromDatabase } from '../../getLiveResourceDefinitionFromDatabase';
import { normalizeDDLToSupportLossyShowCreateStatements } from './normalizeDDLToSupportLossyShowCreateStatements';
import { stripIrrelevantContentFromResourceDDL } from '../stripIrrelevantContentFromResourceDDL/stripIrrelevantContentFromResourceDDL';

describe('normalizeDDLToSupportLossyShowCreateStatements', () => {
  let connection: DatabaseConnection;
  beforeAll(async () => {
    const config = new ControlConfig({
      language: DatabaseLanguage.MYSQL,
      dialect: '5.7',
      connection: await promiseConfig(),
      definitions: [],
      strict: true,
    });
    ({ connection } = await initializeControlEnvironment({ config })); // ensure db is provisioned and get connection
  });
  afterAll(async () => {
    await connection.end();
  });
  it('should be able to normalize the user def and show create into the same string for a view that has a subquery', async () => {
    // define the view sql
    const userDefSql = `
CREATE VIEW \`view_car_current\` AS
SELECT
  s.id as id,
  s.uuid as uuid,
  s.vin as vin,
  (
    SELECT GROUP_CONCAT(car_to_tire.tire_id ORDER BY car_to_tire.array_order_index asc separator ',')
    FROM car_to_tire WHERE car_to_tire.car_id = s.id
  ) as external_id_ids,
  s.created_at as created_at
FROM car s
;
    `;

    // apply the tables needed to apply the view
    await connection.query({ sql: 'DROP TABLE IF EXISTS car' });
    await connection.query({
      sql: 'CREATE TABLE car ( id BIGINT, uuid VARCHAR(255), vin VARCHAR(255), created_at DATETIME )',
    });
    await connection.query({ sql: 'DROP TABLE IF EXISTS car_to_tire' });
    await connection.query({
      sql: 'CREATE TABLE car_to_tire ( car_id BIGINT, tire_id BIGINT, array_order_index TINYINT)',
    });

    // apply the sql
    await connection.query({ sql: 'DROP VIEW IF EXISTS view_car_current;' }); // ensure possible previous state does not affect test
    await connection.query({ sql: userDefSql });

    // get get the SHOW CREATE sql
    const liveResource = await getLiveResourceDefinitionFromDatabase({
      connection,
      resourceName: 'view_car_current',
      resourceType: ResourceType.VIEW,
    });
    const showCreateDefSql = liveResource.sql;

    // check that we normalize to the same thing
    const normalizedUserSqlDef = normalizeDDLToSupportLossyShowCreateStatements({
      ddl: userDefSql,
      resourceType: ResourceType.VIEW,
    });
    const normalizedShowCreateDefSql = stripIrrelevantContentFromResourceDDL({
      ddl: normalizeDDLToSupportLossyShowCreateStatements({
        ddl: showCreateDefSql,
        resourceType: ResourceType.VIEW,
      }),
      resourceType: ResourceType.VIEW,
    });
    expect(normalizedShowCreateDefSql).toEqual(normalizedUserSqlDef);
  });
  it('should be able to normalize user def and show create def, even with joins, and detect no change', async () => {
    const spaceshipTableCreate = `
CREATE TABLE spaceship (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL
) ENGINE = InnoDB;
    `.trim();
    const spaceshipCargoTableCreate = `
CREATE TABLE spaceship_cargo (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  spaceship_id BIGINT NOT NULL,
  owner VARCHAR(191) NOT NULL,
  purpose VARCHAR(191) NOT NULL,
  weight VARCHAR(191) NOT NULL
) ENGINE = InnoDB;
    `.trim();
    const viewCreateStatement = `
CREATE VIEW view_spaceship_with_cargo AS
  SELECT
    s.id as id,
    s.name as name,
    SUM(sc.weight) as total_cargo_weight,
    GROUP_CONCAT(DISTINCT sc.purpose SEPARATOR ',') as all_cargo_purpose
  FROM spaceship s
  JOIN spaceship_cargo sc on sc.spaceship_id = s.id;
    `.trim();

    // apply the tables needed to apply the view
    await connection.query({ sql: 'DROP TABLE IF EXISTS spaceship_cargo' });

    await connection.query({ sql: 'DROP TABLE IF EXISTS spaceship' });
    await connection.query({
      sql: spaceshipTableCreate,
    });
    await connection.query({
      sql: spaceshipCargoTableCreate,
    });

    // apply the sql
    await connection.query({ sql: 'DROP VIEW IF EXISTS view_spaceship_with_cargo;' }); // ensure possible previous state does not affect test
    await connection.query({ sql: viewCreateStatement });

    // get get the SHOW CREATE sql
    const liveResource = await getLiveResourceDefinitionFromDatabase({
      connection,
      resourceName: 'view_spaceship_with_cargo',
      resourceType: ResourceType.VIEW,
    });
    const showCreateDefSql = liveResource.sql;

    // check that we normalize to the same thing
    const normalizedUserSqlDef = normalizeDDLToSupportLossyShowCreateStatements({
      ddl: viewCreateStatement,
      resourceType: ResourceType.VIEW,
    });
    const normalizedShowCreateDefSql = stripIrrelevantContentFromResourceDDL({
      ddl: normalizeDDLToSupportLossyShowCreateStatements({
        ddl: showCreateDefSql,
        resourceType: ResourceType.VIEW,
      }),
      resourceType: ResourceType.VIEW,
    });
    expect(normalizedShowCreateDefSql).toEqual(normalizedUserSqlDef);
  });
});
