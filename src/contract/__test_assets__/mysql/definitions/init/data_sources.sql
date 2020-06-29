-- sometimes users want to provision their databases with some initial values or ensure something exists in the database
INSERT INTO data_source (name) VALUES ('FOOGLE') ON DUPLICATE KEY UPDATE name=name; -- on duplicate do nothing -> upsert the static entity
INSERT INTO data_source (name) VALUES ('MAPCREST') ON DUPLICATE KEY UPDATE name=name; -- on duplicate do nothing -> upsert the static entity
