CREATE TABLE notification_version (
  -- meta
  `notification_id` BIGINT NOT NULL, -- fk pointing to static entity
  `effective_at` DATETIME(6) NOT NULL, -- the user should define the effective_at timestamp

  -- mutatable data
  `status` ENUM('WAITING', 'QUEUED', 'SENT') NOT NULL,

  -- meta meta
  PRIMARY KEY (`notification_id`, `effective_at`),
  INDEX notification_version_ix1 (`status`),
  CONSTRAINT notification_version_fk1 FOREIGN KEY (`notification_id`) REFERENCES notification(id)
) ENGINE = InnoDB;
