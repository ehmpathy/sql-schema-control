import { DatabaseLanguage, ResourceType } from '../../../../../../types';
import { getDbConnection } from '../../../__test_assets__/getDbConnection';
import { DatabaseConnection } from '../../../types';
import { showCreateDdlMysql } from '../../showCreateDdlMysql';
import { stripIrrelevantContentFromResourceDDL } from '../stripIrrelevantContentFromResourceDDL/stripIrrelevantContentFromResourceDDL';
import { normalizeDDLToSupportLossyShowCreateStatements } from './normalizeDDLToSupportLossyShowCreateStatements';

describe('normalizeDDLToSupportLossyShowCreateStatements', () => {
  let dbConnection: DatabaseConnection;
  beforeAll(async () => {
    dbConnection = await getDbConnection({ language: DatabaseLanguage.MYSQL });
  });
  afterAll(async () => {
    await dbConnection.end();
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
    await dbConnection.query({ sql: 'DROP TABLE IF EXISTS car' });
    await dbConnection.query({
      sql: 'CREATE TABLE car ( id BIGINT, uuid VARCHAR(255), vin VARCHAR(255), created_at DATETIME )',
    });
    await dbConnection.query({ sql: 'DROP TABLE IF EXISTS car_to_tire' });
    await dbConnection.query({
      sql: 'CREATE TABLE car_to_tire ( car_id BIGINT, tire_id BIGINT, array_order_index TINYINT)',
    });

    // apply the sql
    await dbConnection.query({ sql: 'DROP VIEW IF EXISTS view_car_current;' }); // ensure possible previous state does not affect test
    await dbConnection.query({ sql: userDefSql });

    // get get the SHOW CREATE sql
    const showCreateDefSql = await showCreateDdlMysql({
      dbConnection,
      type: ResourceType.VIEW,
      schema: 'public',
      name: 'view_car_current',
    });

    // check that we normalize to the same thing
    const normalizedUserSqlDef = normalizeDDLToSupportLossyShowCreateStatements(
      {
        ddl: userDefSql,
        resourceType: ResourceType.VIEW,
      },
    );
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
    await dbConnection.query({ sql: 'DROP TABLE IF EXISTS spaceship_cargo' });

    await dbConnection.query({ sql: 'DROP TABLE IF EXISTS spaceship' });
    await dbConnection.query({
      sql: spaceshipTableCreate,
    });
    await dbConnection.query({
      sql: spaceshipCargoTableCreate,
    });

    // apply the sql
    await dbConnection.query({
      sql: 'DROP VIEW IF EXISTS view_spaceship_with_cargo;',
    }); // ensure possible previous state does not affect test
    await dbConnection.query({ sql: viewCreateStatement });

    // get get the SHOW CREATE sql
    const showCreateDefSql = await showCreateDdlMysql({
      dbConnection,
      schema: 'public',
      type: ResourceType.VIEW,
      name: 'view_spaceship_with_cargo',
    });

    // check that we normalize to the same thing
    const normalizedUserSqlDef = normalizeDDLToSupportLossyShowCreateStatements(
      {
        ddl: viewCreateStatement,
        resourceType: ResourceType.VIEW,
      },
    );
    const normalizedShowCreateDefSql = stripIrrelevantContentFromResourceDDL({
      ddl: normalizeDDLToSupportLossyShowCreateStatements({
        ddl: showCreateDefSql,
        resourceType: ResourceType.VIEW,
      }),
      resourceType: ResourceType.VIEW,
    });
    expect(normalizedShowCreateDefSql).toEqual(normalizedUserSqlDef);
  });
  it('should find no change on this real world example where recursive support for views is required', async () => {
    // define the view sql
    const userDefSql = `
    CREATE VIEW \`view_contractor_current\` AS
    SELECT
      s.id,
      s.uuid,
      s.name,
      (
        SELECT GROUP_CONCAT(contractor_version_to_contractor_license.contractor_license_id ORDER BY contractor_version_to_contractor_license.array_order_index asc separator ',')
        FROM contractor_version_to_contractor_license WHERE contractor_version_to_contractor_license.contractor_version_id = v.id
      ) as license_ids,
      (
        SELECT GROUP_CONCAT(contractor_version_to_contact_method.contact_method_id ORDER BY contractor_version_to_contact_method.array_order_index asc separator ',')
        FROM contractor_version_to_contact_method WHERE contractor_version_to_contact_method.contractor_version_id = v.id
      ) as proposed_suggestion_change_ids,
      s.created_at,
      v.effective_at,
      v.created_at as updated_at
    FROM contractor s
    JOIN contractor_cvp cvp ON s.id = cvp.contractor_id
    JOIN contractor_version v ON v.id = cvp.contractor_version_id;
;
    `;

    // apply the tables needed to apply the view
    await dbConnection.query({ sql: 'DROP TABLE IF EXISTS contractor' });
    await dbConnection.query({
      sql: 'CREATE TABLE contractor ( id BIGINT, uuid VARCHAR(255), name VARCHAR(255), created_at DATETIME )',
    });
    await dbConnection.query({
      sql: 'DROP TABLE IF EXISTS contractor_version',
    });
    await dbConnection.query({
      sql: 'CREATE TABLE contractor_version ( id BIGINT, contractor_id BIGINT, created_at DATETIME, effective_at DATETIME)',
    });

    await dbConnection.query({ sql: 'DROP TABLE IF EXISTS contractor_cvp' });
    await dbConnection.query({
      sql: 'CREATE TABLE contractor_cvp ( contractor_id BIGINT, contractor_version_id BIGINT)',
    });
    await dbConnection.query({
      sql: 'DROP TABLE IF EXISTS contractor_version_to_contractor_license',
    });
    await dbConnection.query({
      sql: 'CREATE TABLE contractor_version_to_contractor_license ( contractor_version_id BIGINT, contractor_license_id BIGINT, array_order_index INT )',
    });
    await dbConnection.query({
      sql: 'DROP TABLE IF EXISTS contractor_version_to_contact_method',
    });
    await dbConnection.query({
      sql: 'CREATE TABLE contractor_version_to_contact_method ( contractor_version_id BIGINT, contact_method_id BIGINT, array_order_index INT )',
    });

    // apply the sql
    await dbConnection.query({
      sql: 'DROP VIEW IF EXISTS view_contractor_current;',
    }); // ensure possible previous state does not affect test
    await dbConnection.query({ sql: userDefSql });

    // get get the SHOW CREATE sql
    const showCreateDefSql = await showCreateDdlMysql({
      dbConnection,
      schema: 'public',
      type: ResourceType.VIEW,
      name: 'view_contractor_current',
    });

    // check that we normalize to the same thing
    const normalizedUserSqlDef = normalizeDDLToSupportLossyShowCreateStatements(
      {
        ddl: userDefSql,
        resourceType: ResourceType.VIEW,
      },
    );
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
