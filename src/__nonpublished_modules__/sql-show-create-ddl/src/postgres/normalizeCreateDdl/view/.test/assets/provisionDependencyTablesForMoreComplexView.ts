import type { DatabaseConnection } from '../../../../../types';

const dependencyTablesDdl = [
  `
CREATE TABLE home (
  id bigserial NOT NULL,
  uuid uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name varchar(255) NOT NULL,
  built timestamp with time zone NOT NULL,
  bedrooms int NOT NULL,
  bathrooms int NOT NULL,
  host_ids_hash bytea NOT NULL,
  CONSTRAINT home_pk PRIMARY KEY (id),
  CONSTRAINT home_ux1 UNIQUE (name, host_ids_hash)
);
      `.trim(),
  `
CREATE TABLE home_version (
  id bigserial NOT NULL,
  home_id bigint NOT NULL,
  effective_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  photo_ids_hash bytea NOT NULL,
  CONSTRAINT home_version_pk PRIMARY KEY (id),
  CONSTRAINT home_version_ux1 UNIQUE (home_id, effective_at, created_at),
  CONSTRAINT home_version_fk0 FOREIGN KEY (home_id) REFERENCES home (id)
);
CREATE INDEX home_version_fk0_ix ON home_version USING btree (home_id);
      `.trim(),
  `
CREATE TABLE home_version_to_photo (
  id bigserial NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  home_version_id bigint NOT NULL,
  photo_id bigint NOT NULL,
  array_order_index smallint NOT NULL,
  CONSTRAINT home_version_to_photo_pk PRIMARY KEY (id),
  CONSTRAINT home_version_to_photo_ux1 UNIQUE (home_version_id, array_order_index),
  CONSTRAINT home_version_to_photo_fk0 FOREIGN KEY (home_version_id) REFERENCES home_version (id)
  -- CONSTRAINT home_version_to_photo_fk1 FOREIGN KEY (photo_id) REFERENCES photo (id)
);
CREATE INDEX home_version_to_photo_fk0_ix ON home_version_to_photo USING btree (home_version_id);
CREATE INDEX home_version_to_photo_fk1_ix ON home_version_to_photo USING btree (photo_id);
      `.trim(),
  `
CREATE TABLE home_to_host (
  id bigserial NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  home_id bigint NOT NULL,
  host_id bigint NOT NULL,
  array_order_index smallint NOT NULL,
  CONSTRAINT home_to_host_pk PRIMARY KEY (id),
  CONSTRAINT home_to_host_ux1 UNIQUE (home_id, array_order_index),
  CONSTRAINT home_to_host_fk0 FOREIGN KEY (home_id) REFERENCES home (id)
  -- CONSTRAINT home_to_host_fk1 FOREIGN KEY (host_id) REFERENCES host (id)
);
CREATE INDEX home_to_host_fk0_ix ON home_to_host USING btree (home_id);
CREATE INDEX home_to_host_fk1_ix ON home_to_host USING btree (host_id);
      `.trim(),
  `
CREATE TABLE home_cvp (
  id bigserial NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  home_id bigint NOT NULL,
  home_version_id bigint NOT NULL,
  CONSTRAINT home_cvp_pk PRIMARY KEY (id),
  CONSTRAINT home_cvp_ux1 UNIQUE (home_id),
  CONSTRAINT home_cvp_fk0 FOREIGN KEY (home_id) REFERENCES home (id),
  CONSTRAINT home_cvp_fk1 FOREIGN KEY (home_version_id) REFERENCES home_version (id)
);
CREATE INDEX home_cvp_fk0_ix ON home_cvp USING btree (home_id);
CREATE INDEX home_cvp_fk1_ix ON home_cvp USING btree (home_version_id);
      `.trim(),
];
const dependencyTablesNames = [
  'home_cvp',
  'home_to_host',
  'home_version_to_photo',
  'home_version',
  'home',
];
export const provisionDependencyTablesForMoreComplexView = async ({
  dbConnection,
}: {
  dbConnection: DatabaseConnection;
}) => {
  await Promise.all(
    dependencyTablesNames.map((tableName) =>
      dbConnection.query({ sql: `DROP TABLE IF EXISTS ${tableName} CASCADE` }),
    ),
  );
  await Promise.all(
    dependencyTablesDdl.map((ddl) => dbConnection.query({ sql: ddl })),
  );
};
