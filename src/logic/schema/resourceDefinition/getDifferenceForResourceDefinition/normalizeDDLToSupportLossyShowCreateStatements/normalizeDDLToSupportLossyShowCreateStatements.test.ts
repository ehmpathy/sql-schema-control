import { normalizeDDLToSupportLossyShowCreateStatements } from './normalizeDDLToSupportLossyShowCreateStatements';
import { ResourceType } from '../../../../../types';

describe('normalizeDDLToSupportLossyShowCreateStatements', () => {
  it('should strip comments and reformat table create ddl', () => {
    const cleaned = normalizeDDLToSupportLossyShowCreateStatements({
      ddl: `
        CREATE TABLE \`some_resource_table\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT, -- this id is the primary key, which we define below
          \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `.trim(),
      resourceType: ResourceType.TABLE,
    });
    expect(cleaned).not.toContain('this id is the primary key');
    expect(cleaned).toMatchSnapshot(); // and check snapshot for formatting
  });
  it('should strip comments and reformat view create ddl', () => {
    const cleaned = normalizeDDLToSupportLossyShowCreateStatements({
      ddl: `
CREATE VIEW view_something_for_getResourceCreateStatement AS
SELECT
  'hello, world!' as first_words -- because we want to keep this
  ;
          `.trim(),
      resourceType: ResourceType.TABLE,
    });
    expect(cleaned).not.toContain('because we want to keep this');
    expect(cleaned).toMatchSnapshot(); // and check snapshot for formatting
  });
  it('should normalize view create ddl so that custom user def and show create def match', () => {
    const cleanedUserDef = normalizeDDLToSupportLossyShowCreateStatements({
      ddl: `
CREATE VIEW view_something_for_getResourceCreateStatement AS
select -- test comments
  'hello, world!' as first_words,
  u.id as id
from test_table_getResourceCreateStatement u
where 1=1
    and u.id = 5
          `.trim(),
      resourceType: ResourceType.VIEW,
    });
    const cleanedShowCreateDef = normalizeDDLToSupportLossyShowCreateStatements({
      ddl:
        "CREATE VIEW `view_something_for_getResourceCreateStatement` AS select 'hello, world!' AS `first_words`,`u`.`id` AS `id` from `test_table_getResourceCreateStatement` `u` where ((1 = 1) and (`u`.`id` = 5))",
      resourceType: ResourceType.VIEW,
    });
    expect(cleanedUserDef).toEqual(cleanedShowCreateDef);
  });
});
