import { removeParenthesisSurroundingJoinsInFromClause } from './removeParenthesisSurroundingJoinsInFromClause';

describe('removeParenthesisSurroundingJoinsInFromClause', () => {
  it('should remove them from every join', () => {
    const exampleSql = `
select
  s.id as id,
  s.uuid as uuid,
  s.name as name,
  s.created_at as created_at,
  v.effective_at as effective_at,
  v.created_at as updated_at
from
  (
    (
      contractor s
      join contractor_cvp cvp on s.id = cvp.contractor_id
    )
    join contractor_version v on v.id = cvp.contractor_version_id
  )
    `.trim();
    const normalizedSql = removeParenthesisSurroundingJoinsInFromClause({ flattenedSql: exampleSql });
    expect(normalizedSql).not.toContain('(');
    expect(normalizedSql).not.toContain(')');
    expect(normalizedSql).toMatchSnapshot();
  });
});
