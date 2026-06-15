import { normalizeCreateFunctionDdl } from './normalizeCreateFunctionDdl';

const exampleShowCreateDdl = `
CREATE OR REPLACE FUNCTION public.test_func_for_show_create_on(in_name character varying)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
  DECLARE
    v_test_int int := 821;
  BEGIN
    RETURN v_test_int;
  END;
$function$
`.trim();

describe('normalizeCreateTableDdl', () => {
  it('should be able to replace $function$ with $$', () => {
    const normalizedDdl = normalizeCreateFunctionDdl({
      ddl: exampleShowCreateDdl,
    });
    expect(normalizedDdl).not.toContain('$function$');
    expect(normalizedDdl).toContain('$$');
  });
  it('should replace character varying with varchar', () => {
    const normalizedDdl = normalizeCreateFunctionDdl({
      ddl: exampleShowCreateDdl,
    });
    expect(normalizedDdl).not.toContain('character varying');
    expect(normalizedDdl).toContain('varchar');
  });
  it('should stick each input arg on its own line', () => {
    const normalizedDdl = normalizeCreateFunctionDdl({
      ddl: exampleShowCreateDdl,
    });
    expect(normalizedDdl).not.toContain('(in_name character varying)');
    expect(normalizedDdl).toContain(`(
  in_name varchar
)`);
  });
  it('should remove the precision from varchar, since it does not matter on fn inputs and postgres does not return it', () => {
    const exampleShowCreateDdl = `
CREATE OR REPLACE FUNCTION public.test_func_for_show_create_on(
  in_name varchar(255)
)
RETURNS integer
LANGUAGE plpgsql
AS $$
  DECLARE
    v_test_int int := 821;
  BEGIN
    RETURN v_test_int;
  END;
$$
    `.trim();
    const normalizedDdl = normalizeCreateFunctionDdl({
      ddl: exampleShowCreateDdl,
    });
    expect(normalizedDdl).not.toContain('varchar(255)');
    expect(normalizedDdl).toContain('varchar\n');
  });
});
