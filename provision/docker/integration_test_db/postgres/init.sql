-- initialize the extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- initialize the schema
CREATE SCHEMA superimportantdb; -- by default we write to the schema w/ same name as db
