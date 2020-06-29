CREATE TABLE data_source (
  -- meta
  id              bigserial,
  created_at      timestamp with time zone NOT NULL DEFAULT now(),

  -- static
  name            varchar NOT NULL,

  -- meta meta
  CONSTRAINT data_source_ux1 UNIQUE (name)
)
