CREATE TABLE data_source (
  -- meta
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- static
  name            VARCHAR(128) NOT NULL,

  -- meta meta
  CONSTRAINT data_source_ux1 UNIQUE (name)
) ENGINE = InnoDB;
