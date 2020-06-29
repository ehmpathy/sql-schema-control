import sqlFormatter from 'sql-formatter';
import { recursivelyHeavilyNormalizeViewDdl } from '../../../generic/recursivelyHeavilyNormalizeViewDdl/recursivelyHeavilyNormalizeViewDdl';

/**
 * normalize generated create table ddl for comparisons
 *
 * TODO: name this function specific to its use case
 * e.g., "normalizeForSchemaComparison" or something similar
 */
export const normalizeCreateViewDdl = ({ ddl }: { ddl: string }) => {
  let prettierDdl = ddl;

  // remove any ":: __TYPE__" casting that could exist in the DDL. this level of information has not been found as useful yet
  prettierDdl = prettierDdl.replace(/ ?:: ?\w+( ?\[\])?/g, '');

  // remove the extra parens that postgres's viewdef fn adds in
  prettierDdl = recursivelyHeavilyNormalizeViewDdl({ ddl: prettierDdl });

  // format that ddl, to make standard spacing and appearance of ddl
  prettierDdl = sqlFormatter.format(prettierDdl);

  // make sure that we dont have CREATE & OR REPLACE on two lines
  prettierDdl = prettierDdl.replace(/CREATE\nOR REPLACE/, 'CREATE OR REPLACE');

  // return the normalized ddl
  return prettierDdl;
};
