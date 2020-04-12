/**
 * make all "as" words, except the first, lowercase
 *
 * for some reason, SHOW CREATE lowercases all tokens EXCEPT `as`, which it explicitly upper cases...)
 */
export const lowercaseAllAsTokensExceptFirstOne = ({ ddl }: { ddl: string }) => {
  return ddl
    .replace(/ AS /g, ' as ') // /g to apply to each
    .replace(/ as /, ' AS '); // no /g so only apply to first case
};
