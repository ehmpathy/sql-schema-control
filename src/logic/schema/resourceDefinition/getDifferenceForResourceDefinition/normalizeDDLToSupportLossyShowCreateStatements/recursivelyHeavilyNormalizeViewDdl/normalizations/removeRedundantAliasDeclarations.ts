/**
 * SHOW CREATE adds `as column_name` to every `table.column_name` even when alias is implicit
 *
 * we dont want to force users to have to do that, so lets strip the redundant ones before comparing diff
 */
export const removeRedundantAliasDeclarations = ({ sql }: { sql: string }) => {
  return sql.replace(/(\w+\.(\w+))\s+as\s+\2/g, '$1'); // i.e., if column name (second matching group) matches alias declaration, replace it with just the selector (first matching group)
};
