CREATE TABLE spaceship_cargo (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `spaceship_id` BIGINT NOT NULL,
  `owner` VARCHAR(191) NOT NULL,
  `purpose` VARCHAR(191) NOT NULL,
  `weight` VARCHAR(191) NOT NULL,
  CONSTRAINT spaceship_cargo_fk1 FOREIGN KEY (`spaceship_id`) REFERENCES spaceship(id)
) ENGINE = InnoDB;
