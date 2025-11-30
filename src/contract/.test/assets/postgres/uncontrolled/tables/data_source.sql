CREATE TABLE data_source (
  id bigserial NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name varchar NOT NULL,
  CONSTRAINT data_source_ux1 UNIQUE (name)
);