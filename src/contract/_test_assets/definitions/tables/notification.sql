CREATE TABLE notification (
  -- meta
  `id` BIGINT NOT NULL AUTO_INCREMENT, -- pk
  `uuid` CHAR(36) NOT NULL, -- uuid
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- static data
  `user_uuid` CHAR(36) NOT NULL, -- uuid
  `method` ENUM('APP', 'SMS') NOT NULL,
  `address` VARCHAR(255) NOT NULL, -- e.g, a phone number
  `message_id` BIGINT NOT NULL, -- pointer to message to send; one:many
  `wait_until` DATETIME(3) NOT NULL, -- when can we send the notification

  -- meta meta
  PRIMARY KEY (`id`),
  UNIQUE INDEX notifications_ux1 (`user_uuid`, `method`, `address`, `message_id`, `wait_until`),
  CONSTRAINT notification_fk1 FOREIGN KEY (`message_id`) REFERENCES message(id)
) ENGINE = InnoDB;
CREATE TABLE notification_version (
  -- meta
  `id` BIGINT NOT NULL AUTO_INCREMENT, -- pk
  `notification_id` BIGINT NOT NULL, -- fk pointing to static entity
  `effective_at` DATETIME(6) NOT NULL, -- the user should define the effective_at timestamp

  -- mutatable data
  `status` ENUM('WAITING', 'QUEUED', 'SENT') NOT NULL,

  -- meta meta
  PRIMARY KEY (`notification_id`, `effective_at`),
  INDEX notification_version_ix1 (`status`),
  CONSTRAINT notification_version_fk1 FOREIGN KEY (`notification_id`) REFERENCES notification(id)
) ENGINE = InnoDB;
