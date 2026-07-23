-- idempotent migration: rename change_id -> change_exid on extant change_log tables
-- .why = the natural-key column was renamed id -> exid; this preserves every stored value
--        (a pure column rename, zero data migration) so extant changelogs still match.
-- .race = the IF-EXISTS guard and the ALTER are not one atomic step, so two concurrent
--         provisioners could both pass the guard; the exception handler makes the loser of
--         that race a no-op (undefined_column = the column was already renamed away) rather
--         than a crash, so the migration stays safe under concurrent provision.
DO $$
BEGIN
  -- .schema = qualify by current_schema() (the postgres analog of mysql's DATABASE()); without
  --           it, information_schema.columns spans every schema on the search_path, so under a
  --           multi-schema deployment (SET search_path per connectToDatabase) an already-migrated
  --           peer schema's change_exid would make NOT EXISTS false and silently skip this
  --           schema's rename.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'schema_control_change_log'
      AND column_name = 'change_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'schema_control_change_log'
      AND column_name = 'change_exid'
  ) THEN
    BEGIN
      ALTER TABLE schema_control_change_log RENAME COLUMN change_id TO change_exid;
    EXCEPTION
      WHEN undefined_column OR duplicate_column THEN
        -- a concurrent provisioner already performed the rename; the migration is
        -- idempotent, so absorb the race and continue.
        NULL;
    END;
  END IF;
END $$;
