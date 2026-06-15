import { removeRedundantAliasDeclarations } from './removeRedundantAliasDeclarations';

describe('removeRedundantAliasDeclarations', () => {
  test('redundant declarations to be removed and nonredundant to remain', () => {
    const exampleSql = `
CREATE VIEW \`view_contractor_current\` AS
SELECT
  s.id,
  s.uuid as uuid,
  s.name as name,
  (
    SELECT GROUP_CONCAT(contractor_version_to_contractor_license.contractor_license_id ORDER BY contractor_version_to_contractor_license.array_order_index)
    FROM contractor_version_to_contractor_license WHERE contractor_version_to_contractor_license.contractor_version_id = v.id
  ) as license_ids,
  (
    SELECT GROUP_CONCAT(contractor_version_to_contact_method.contact_method_id ORDER BY contractor_version_to_contact_method.array_order_index)
    FROM contractor_version_to_contact_method WHERE contractor_version_to_contact_method.contractor_version_id = v.id
  ) as proposed_suggestion_change_ids,
  s.created_at,
  v.effective_at,
  v.created_at as updated_at
FROM contractor s
JOIN contractor_cvp cvp ON s.id = cvp.contractor_id
JOIN contractor_version v ON v.id = cvp.contractor_version_id;
    `;
    const normalizedSql = removeRedundantAliasDeclarations({ sql: exampleSql });
    expect(normalizedSql).not.toContain('as uuid');
    expect(normalizedSql).not.toContain('as name');
    expect(normalizedSql).toMatchSnapshot(); // for visual inspection to make sure no other defects occured
  });
});
