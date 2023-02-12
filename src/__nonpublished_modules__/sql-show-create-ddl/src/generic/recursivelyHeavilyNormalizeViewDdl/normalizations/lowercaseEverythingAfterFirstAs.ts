/**
 *  lowercase everything in the query, since show create does :upside_down_smiley:
 */
export const lowercaseEverythingAfterFirstAs = ({ ddl }: { ddl: string }) => {
  const casedAsDdlParts = ddl.split(' AS ');
  const casedDdl = [casedAsDdlParts[0], casedAsDdlParts[1].toLowerCase()].join(
    ' AS ',
  );
  return casedDdl;
};
