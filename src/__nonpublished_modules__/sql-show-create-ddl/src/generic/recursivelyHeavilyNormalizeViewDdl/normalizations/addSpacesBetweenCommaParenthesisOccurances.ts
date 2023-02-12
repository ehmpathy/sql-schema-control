/**
 * replace `,(` patterns w/ space in between, since our formatter downstream does not like that
 */
export const addSpacesBetweenCommaParenthesisOccurances = ({
  ddl,
}: {
  ddl: string;
}) => {
  return ddl.replace(/,\(/g, ', (');
};
