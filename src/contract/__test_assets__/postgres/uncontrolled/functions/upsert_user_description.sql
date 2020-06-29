CREATE OR REPLACE FUNCTION upsert_user_description(
  in_from_user_id bigint
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
  BEGIN
    -- just select something, and also include a comment
    SELECT false;
  END;
$$
