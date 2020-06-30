
CREATE OR REPLACE FUNCTION public.show_create_table(
  in_schema_name varchar,
  in_table_name varchar
)
RETURNS text
LANGUAGE plpgsql VOLATILE
AS
$$
  DECLARE
    -- the ddl we're building
    v_table_ddl text;

    -- data about the target table
    v_table_oid int;

    -- records for looping
    v_column_record record;
    v_constraint_record record;
    v_index_record record;
  BEGIN
    -- grab the oid of the table; https://www.postgresql.org/docs/8.3/catalog-pg-class.html
    SELECT c.oid INTO v_table_oid
    FROM pg_catalog.pg_class c
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE 1=1
      AND c.relkind = 'r' -- r = ordinary table; https://www.postgresql.org/docs/9.3/catalog-pg-class.html
      AND c.relname = in_table_name -- the table name
      AND n.nspname = in_schema_name; -- the schema

    -- throw an error if table was not found
    IF (v_table_oid IS NULL) THEN
      RAISE EXCEPTION 'table does not exist';
    END IF;

    -- start the create definition
    v_table_ddl := 'CREATE TABLE ' || in_schema_name || '.' || in_table_name || ' (' || E'\n';

    -- define all of the columns in the table; https://stackoverflow.com/a/8153081/3068233
    FOR v_column_record IN
      SELECT
        c.column_name,
        c.data_type,
        COALESCE(
          c.character_maximum_length,
          CASE WHEN c.data_type = 'numeric' THEN c.numeric_precision ELSE null END -- only consider numeric_precision for the 'numeric' column, all others dont specify
        ) as precision,
        CASE WHEN c.numeric_scale IS NOT null AND c.numeric_scale <> 0 THEN c.numeric_scale ELSE null END as scale,
        c.is_nullable,
        c.column_default
      FROM information_schema.columns c
      WHERE (table_schema, table_name) = (in_schema_name, in_table_name)
      ORDER BY ordinal_position
    LOOP
      v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
        || v_column_record.column_name || ' '
        || v_column_record.data_type
        || CASE WHEN v_column_record.precision IS NOT NULL THEN
          (
            '('
            || v_column_record.precision
            || CASE WHEN v_column_record.scale IS NOT NULL THEN (', ' || v_column_record.scale) ELSE '' END
            || ')'
          ) ELSE '' END || ' '
        || CASE WHEN v_column_record.is_nullable = 'NO' THEN 'NOT NULL' ELSE 'NULL' END
        || CASE WHEN v_column_record.column_default IS NOT null THEN (' DEFAULT ' || v_column_record.column_default) ELSE '' END
        || ',' || E'\n';
    END LOOP;

    -- define all the constraints in the; https://www.postgresql.org/docs/9.1/catalog-pg-constraint.html && https://dba.stackexchange.com/a/214877/75296
    FOR v_constraint_record IN
      SELECT
        con.conname as constraint_name,
        con.contype as constraint_type,
        CASE
          WHEN con.contype = 'p' THEN 1 -- primary key constraint
          WHEN con.contype = 'u' THEN 2 -- unique constraint
          WHEN con.contype = 'f' THEN 3 -- foreign key constraint
          WHEN con.contype = 'c' THEN 4
          ELSE 5
        END as type_rank,
        pg_get_constraintdef(con.oid) as constraint_definition
      FROM pg_catalog.pg_constraint con
      JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
      JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
      WHERE nsp.nspname = in_schema_name
      AND rel.relname = in_table_name
      ORDER BY type_rank, constraint_name -- pk > uuid > fk; fk0 > fk1
    LOOP
      v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
        || 'CONSTRAINT' || ' '
        || v_constraint_record.constraint_name || ' '
        || v_constraint_record.constraint_definition
        || ',' || E'\n';
    END LOOP;

    -- drop the last comma before ending the create statement
    v_table_ddl = substr(v_table_ddl, 0, length(v_table_ddl) - 1) || E'\n';

    -- end the create definition
    v_table_ddl := v_table_ddl || ');' || E'\n';

    -- suffix create statement with all of the indexes on the table
    FOR v_index_record IN
      SELECT indexdef
      FROM pg_indexes i
      LEFT JOIN pg_catalog.pg_constraint c ON i.indexname = c.conname
      WHERE 1=1
        AND (schemaname, tablename) = (in_schema_name, in_table_name)
        AND c.contype is null -- and is not an index auto created for a constraint
      ORDER BY indexdef asc -- makes it so that "fk0" ordered before "fk1"
    LOOP
      v_table_ddl := v_table_ddl
        || v_index_record.indexdef
        || ';' || E'\n';
    END LOOP;

    -- return the ddl
    RETURN v_table_ddl;
  END;
$$;
