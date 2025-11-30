CREATE TABLE some_resource_table (
  id bigserial NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT some_resource_table_pk PRIMARY KEY (id)
);