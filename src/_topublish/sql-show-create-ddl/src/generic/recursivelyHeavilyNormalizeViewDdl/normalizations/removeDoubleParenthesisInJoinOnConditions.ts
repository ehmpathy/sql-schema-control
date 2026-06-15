/**
 * strip out the "double parenthesis" that SHOW CREATE likes to put on the "join on" statements
 */
export const removeDoubleParenthesisInJoinOnConditions = ({
  sql,
}: {
  sql: string;
}) => {
  return sql.replace(/ on\(\((\w+\.\w+\s=\s\w+\.\w+)\)\)/g, ' on $1 '); // note: strictly only do this if matching the SHOW CREATE weird format of ` on((tableA.column = tableB.column))`
};
