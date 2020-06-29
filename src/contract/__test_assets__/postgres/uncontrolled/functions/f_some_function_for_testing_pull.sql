CREATE OR REPLACE FUNCTION f_some_function_for_testing_pull(
  in_message varchar
)
RETURNS bigint
LANGUAGE plpgsql
AS $$
  BEGIN
    RETURN 821;
  END;
$$
