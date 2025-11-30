CREATE PROCEDURE upsert_message(
  IN in_message TEXT
)
BEGIN
  DECLARE v_message_hash BINARY(32);
  DECLARE v_message_id BIGINT;

  -- assert the message exists
  SET v_message_id = find_message_id_by_text(in_message);
  IF (v_message_id IS null) THEN
    SET v_message_hash = find_message_hash_by_text(in_message);
    INSERT INTO messages
      (text, hash)
      VALUES
      (in_message, v_message_hash);
  END IF;
END;
