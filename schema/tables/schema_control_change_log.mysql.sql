CREATE TABLE IF NOT EXISTS schema_control_change_log ( -- TODO: make this a versioned entity with a 'current' view
  -- meta
  id              INT(11) PRIMARY KEY AUTO_INCREMENT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP, -- this should _never_ occur

  -- data
  change_id             VARCHAR(191) NOT NULL, -- record the human generated id of the content
  change_hash           CHAR(64) NOT NULL, -- record a hash of the applied content
  change_content        TEXT, -- record the content that was applied

  -- meta meta
  UNIQUE invitation_ux1 (change_id) -- should be max one row per change_id
) ENGINE = InnoDB;
