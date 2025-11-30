CREATE TABLE spaceship_cargo (
  id BIGSERIAL,
  spaceship_id BIGINT NOT NULL,
  owner VARCHAR(191) NOT NULL,
  purpose VARCHAR(191) NOT NULL,
  weight int NOT NULL,
  CONSTRAINT spaceship_cargo_fk1 FOREIGN KEY (spaceship_id) REFERENCES spaceship (id)
)
