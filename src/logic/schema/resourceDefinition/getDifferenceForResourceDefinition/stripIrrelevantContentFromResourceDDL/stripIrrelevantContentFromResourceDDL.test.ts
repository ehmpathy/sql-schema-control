import { stripIrrelevantContentFromResourceDDL } from './stripIrrelevantContentFromResourceDDL';
import { ResourceType } from '../../../../../types';

describe('stripIrrelevantContentFromResourceDDL', () => {
  it('should strip the DEFINER from PROCEDUREs', () => {
    const relevantContent = stripIrrelevantContentFromResourceDDL({
      ddl: `
CREATE DEFINER=\`root\`@\`%\` PROCEDURE \`upsert_user_description\`(
  IN in_from_user_id BIGINT
)
BEGIN
  -- just select something, and also include a comment
  SELECT false;
END
      `.trim(),
      resourceType: ResourceType.PROCEDURE,
    });
    expect(relevantContent).not.toContain('DEFINER');
    expect(relevantContent).toMatchSnapshot();
  });
  it('should strip the DEFINER from FUNCTIONs', () => {
    const relevantContent = stripIrrelevantContentFromResourceDDL({
      ddl: `
CREATE DEFINER=\`root\`@\`%\` FUNCTION \`upsert_user_description\`(
  in_from_user_id BIGINT
) RETURNS boolean
BEGIN
  -- just select something, and also include a comment
  SELECT false;
END
      `.trim(),
      resourceType: ResourceType.FUNCTION,
    });
    expect(relevantContent).not.toContain('DEFINER');
    expect(relevantContent).toMatchSnapshot();
  });
  it('should strip the AUTO_INCREMENT index from TABLEs', () => {
    const relevantContent = stripIrrelevantContentFromResourceDDL({
      ddl: `
CREATE TABLE \`some_resource_table\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `.trim(),
      resourceType: ResourceType.TABLE,
    });
    expect(relevantContent).not.toContain('AUTO_INCREMENT=');
    expect(relevantContent).toMatchSnapshot();
  });
});
