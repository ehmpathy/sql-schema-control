/**
 * show create drops the final semicolon. it really doesnt matter if the user still has theirs
 */
export const removeFinalSemicolon = ({ ddl }: { ddl: string }) => {
  return ddl.replace(/;/g, '');
};
