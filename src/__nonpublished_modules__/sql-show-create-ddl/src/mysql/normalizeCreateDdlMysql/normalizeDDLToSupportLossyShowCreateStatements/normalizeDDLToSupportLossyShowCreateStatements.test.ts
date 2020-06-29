import { normalizeDDLToSupportLossyShowCreateStatements } from './normalizeDDLToSupportLossyShowCreateStatements';
import { ResourceType } from '../../../../../../types';

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
  it('should be able to normalize this ddl so that show create def looks reasonable', () => {
    const showCreateDdlExample =
      "CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `view_contractor_current` AS select `s`.`id` AS `id`,`s`.`uuid` AS `uuid`,`s`.`name` AS `name`,(select group_concat(`contractor_version_to_contractor_license`.`contractor_license_id` order by `contractor_version_to_contractor_license`.`array_order_index` ASC separator ',') from `contractor_version_to_contractor_license` where (`contractor_version_to_contractor_license`.`contractor_version_id` = `v`.`id`)) AS `license_ids`,(select group_concat(`contractor_version_to_contact_method`.`contact_method_id` order by `contractor_version_to_contact_method`.`array_order_index` ASC separator ',') from `contractor_version_to_contact_method` where (`contractor_version_to_contact_method`.`contractor_version_id` = `v`.`id`)) AS `proposed_suggestion_change_ids`,`s`.`created_at` AS `created_at`,`v`.`effective_at` AS `effective_at`,`v`.`created_at` AS `updated_at` from ((`contractor` `s` join `contractor_cvp` `cvp` on((`s`.`id` = `cvp`.`contractor_id`))) join `contractor_version` `v` on((`v`.`id` = `cvp`.`contractor_version_id`)))";
    normalizeDDLToSupportLossyShowCreateStatements({
      ddl: showCreateDdlExample,
      resourceType: ResourceType.VIEW,
    });
  });
});
