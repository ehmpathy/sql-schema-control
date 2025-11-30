/**
 * normalize generated create function ddl for comparisons
 */
export const normalizeCreateFunctionDdl = ({ ddl }: { ddl: string }) => {
  let prettierDdl = ddl;

  // replace $function$ w/ $$, it is more natural
  prettierDdl = prettierDdl.replace(/\$function\$/g, '$$$'); // note: for some reason, $$$ => $$

  // although `character varying` is the canonical term, `varchar` is used more regularly in practice -> more helpful
  prettierDdl = prettierDdl.replace(/character varying/g, 'varchar');

  // replace varchar(precision) w/ just varchar, since postgres does not care about a "precision" in function parameters. also, prevents next part from messing up:
  prettierDdl = prettierDdl.replace(/ varchar\(\d+\)/g, ' varchar');

  // postgres converts `int` to `integer`, but `bigint` is kept as `bigint`.... lets be consistent and just use the shorthand
  prettierDdl = prettierDdl.replace(/ integer/g, ' int');

  // make sure that function inputs each have their own line. postgres returns them all on one line - hard to read
  prettierDdl = (() => {
    const partsSplitOnParens = prettierDdl.split(/([()])/g);
    const functionParams = partsSplitOnParens[2];
    const functionParamsWithNewlines = `\n  ${functionParams
      ?.replace(/, /g, ',\n  ')
      .trim()}\n`;
    return [
      partsSplitOnParens[0],
      '(',
      functionParamsWithNewlines,
      ')',
      ...partsSplitOnParens.slice(4),
    ].join('');
  })();

  // make sure there is no weird one space before RETURNS and LANGUAGE
  prettierDdl = prettierDdl
    .replace(/ RETURNS/, 'RETURNS')
    .replace(/ LANGUAGE/, 'LANGUAGE');

  return prettierDdl;
};
