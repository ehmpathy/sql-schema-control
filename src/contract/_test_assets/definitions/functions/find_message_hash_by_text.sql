CREATE FUNCTION find_message_hash_by_text(
  in_message TEXT
)
RETURNS BINARY(32)
BEGIN
  RETURN UNHEX(SHA(in_message));
END;
