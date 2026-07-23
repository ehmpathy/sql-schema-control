-- idempotent migration: rename change_id -> change_exid on extant change_log tables
-- .why = the natural-key column was renamed id -> exid; this preserves every stored value
--        (a pure column rename, zero data migration) so extant changelogs still match.
-- .race = the schema check and the ALTER are not one atomic step, so two concurrent
--         provisioners could both read change_id as present; this advisory lock serializes
--         them so the loser re-reads the schema AFTER the winner's rename, sees change_exid
--         already present, and falls through to the DO 0 no-op instead of a crash.
SET @lock_acquired := GET_LOCK('sql_schema_control.migrate_change_id_to_change_exid', 10);

SET @has_change_id := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'schema_control_change_log'
    AND column_name = 'change_id'
);
SET @has_change_exid := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'schema_control_change_log'
    AND column_name = 'change_exid'
);
-- .failloud = GET_LOCK returns 1 = acquired, 0 = timeout, NULL = error. only under 1 is the
--             check-then-act serialized; on 0/NULL the loser would run unprotected, back in
--             the very race the lock exists to close. so on non-acquire we abort loud (an
--             unknown-column reference forces a clear error) instead of a silent slip. a
--             retry re-acquires the freed lock and no-ops.
SET @stmt := IF(
  @lock_acquired <=> 1,
  IF(
    @has_change_id > 0 AND @has_change_exid = 0,
    'ALTER TABLE schema_control_change_log CHANGE change_id change_exid VARCHAR(191) NOT NULL',
    'DO 0'
  ),
  'SELECT `migrate_change_id_to_change_exid: could not acquire advisory lock`'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- release only the lock we actually acquired (a no-op release is harmless, but explicit is clearer)
SET @lock_released := IF(@lock_acquired <=> 1, RELEASE_LOCK('sql_schema_control.migrate_change_id_to_change_exid'), NULL);
