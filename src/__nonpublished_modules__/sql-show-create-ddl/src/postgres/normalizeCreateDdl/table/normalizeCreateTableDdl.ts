import sqlFormatter from 'sql-formatter';

/**
 * normalize generated create table ddl for comparisons
 *
 * TODO: name this function specific to its use case
 * e.g., "normalizeForSchemaComparison" or something similar
 */
export const normalizeCreateTableDdl = ({ ddl }: { ddl: string }) => {
  // prettify that ddl, to make standard spacing and appearance of ddl
  let prettierDdl = sqlFormatter.format(ddl);

  // swap back to better aliases
  prettierDdl = prettierDdl.replace(
    /int NOT NULL DEFAULT nextval\(['\w: \n]+\)/g,
    'serial NOT NULL',
  ); // e.g., `bigint DEFAULT nextval('test_tb_for_show_create_on_id_seq' :: regclass)` -> `bigserial`; although 'bigint default ...' is the canonical def, its just too verbose to be useful
  prettierDdl = prettierDdl.replace(/character varying/g, 'varchar'); // although `character varying` is the canonical term, `varchar` is used more regularly in practice -> more helpful
  prettierDdl = prettierDdl.replace(/ integer /g, ' int '); // postgres converts `int` to `integer`, but `bigint` is kept as `bigint`.... lets be consistent and just use the shorthand
  prettierDdl = prettierDdl.replace(/ ?:: ?\w+( ?\[\])?/g, ''); // remove any ":: __TYPE__" casting that could exist in the DDL. this level of information has not been found as useful yet

  // postgres stores CHECK ($COLUMN_NAME IN ('A', 'B', 'C')) in an ugly way. change it back for ease of reading
  prettierDdl = prettierDdl.replace(
    /CHECK \([\s\n]+\([\s\n]+\(([\w_]+)\) = ANY \([\s\n]+\([\s\n]+ ARRAY \[([\w\d', -_]+)\][\s\n]+\)[\s\n]+\)[\s\n]+\)[\s\n]+\)/g,
    'CHECK ($1 IN ($2))',
  );

  // replace `REFERENCES table_name(id)` with `REFERENCES table_name (id)` for consistency
  prettierDdl = prettierDdl.replace(
    /REFERENCES ([\w_]+)\(([\w_]+)\)/g,
    'REFERENCES $1 ($2)',
  );

  // reprettify the ddl
  const reprettyDdl = sqlFormatter.format(prettierDdl);

  // return the normalized ddl
  return reprettyDdl;
};
