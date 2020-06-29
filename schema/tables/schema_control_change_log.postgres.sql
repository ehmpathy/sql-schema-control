CREATE TABLE IF NOT EXISTS schema_control_change_log ( -- TODO: make this a versioned entity with a 'current' view
  -- meta
  id              bigserial,
  created_at      timestamp with time zone default now(),
  updated_at      timestamp with time zone,

  -- data
  change_id             VARCHAR NOT NULL, -- record the human generated id of the content
  change_hash           CHAR(64) NOT NULL, -- record a hash of the applied content
  change_content        TEXT, -- record the content that was applied

  -- meta meta
  CONSTRAINT schema_control_change_log_pg PRIMARY KEY (id),
  CONSTRAINT schema_control_change_log_ux1 UNIQUE (change_id) -- should be max one row per change_id
)
