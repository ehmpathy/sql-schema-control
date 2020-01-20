schema-control
==============

Declarative database schema management. Provision, track, sync, and modify your database schema with plain, version controlled, sql.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/schema-control.svg)](https://npmjs.org/package/schema-control)
[![Codecov](https://codecov.io/gh/uladkasach/schema-control/branch/master/graph/badge.svg)](https://codecov.io/gh/uladkasach/schema-control)
[![Downloads/week](https://img.shields.io/npm/dw/schema-control.svg)](https://npmjs.org/package/schema-control)
[![License](https://img.shields.io/npm/l/schema-control.svg)](https://github.com/uladkasach/schema-control/blob/master/package.json)

# Table of Contents
<!-- toc -->
- [Goals](#goals)
- [Background](#background)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
  - [`schema-control apply`](#schema-control-apply)
  - [`schema-control help [COMMAND]`](#schema-control-help-command)
  - [`schema-control plan`](#schema-control-plan)
  - [`schema-control pull`](#schema-control-pull)
  - [`schema-control sync`](#schema-control-sync)
- [Contribution](#contribution)
<!-- tocstop -->

# Goals

The goal of Schema Control is to make database schema definitions as version controlled, declarative, simple to maintain as possible.

This includes:
- applying and reapplying `changes` to the database
- applying, reapplying, and detecting when migrations are needed for `resources` to the database
- detecting when live resources in the database are out of sync with controlled in resource definitions
- detecting uncontrolled resources live in database

And Enables:
- eliminating manual DDL and DCL queries and manual data provisioning
- automatically provisioning databases for integration testing
- database management in CICD
- tracking all schema definitions in version control
  - all definitions: from creating users and initial data to altering tables

This project takes inspiration from Liquibase and Terraform.


# Background

Schema Control operates on two schema management classes: changes and resources.

Changes are simply sets of sql statements that you wish to apply to the database. Everything can be done with changes - and schema-control simply tracks whether each change has been applied and whether it is still up to date (i.e., comparing the hash).

Resources are DDL created entities that we can track and "sync" with your checked in code. Schema Control is able to detect resources in your live database that are not checked into your code, resources that have not been added to your database, and resources that are out of sync between the definition in your code and what lives in your database - as well as specifying how exactly they are out of sync.


# Installation

1. Save the package as a dev dependency
  ```sh
  npm install --save-dev schema-control
  ```

2. Define the database connection that schema-control can use
  ```js
  // e.g., ./schema/control.connection.js
  const Config = require('config-with-paramstore').default;
  const configInstance = new Config();
  const promiseConfig = async () => configInstance.get();

  const promiseSchemaControlConfig = async () => {
    const config = await promiseConfig();
    console.log(config);
    const dbConfig = config.database.admin; // NOTE: schema control must have DDL privileges
    const schemaControlConfig = {
      host: dbConfig.host,
      port: dbConfig.port,
      schema: dbConfig.schema,
      username: dbConfig.user,
      password: dbConfig.pass,
    };
    return schemaControlConfig;
  };

  module.exports = {
    promiseConfig: promiseSchemaControlConfig,
  }
  ```

4. Define a root control config yml
  ```yml
    # e.g., ./schema/control.yml
    language: mysql
    dialect: 5.7
    connection: ./control.connection.js
    strict: true # true by default; false -> don't track uncontrolled resources
    definitions:
      - type: change
        path: './init/service_user.sql'
        id: 'init_20190619_1'
        reappliable: false
      - type: resource
        path: './definitions/procedures/upsert_notification.sql'
      - ./definitions/tables.yml
      - ./definitions/procedures.yml
      - ./definitions/functions.yml
      # ... more definitions or paths to nested definition files
  ```

5. Test it out!
```
  $ npx schema-control version
  $ npx schema-control plan
```

# Usage

The typical use case consists of planning and applying:
```sh
  $ npx schema-control plan # to see what actions need to be done to sync your db
  $ npx schema-control apply # to sync your db with your checked in schema
```

These commands will operate on all resource and change definitions that are defined in your config (i.e., `control.yml`).

If your schema control config specified strict control, then you may also want to pull resources that are not currently defined in your version control so that you can add them as controlled resources:
```sh
  $ npx schema-control pull # records the create DDL for each uncontrolled resource
```

# Commands
<!-- commands -->
* [`schema-control apply`](#schema-control-apply)
* [`schema-control help [COMMAND]`](#schema-control-help-command)
* [`schema-control plan`](#schema-control-plan)
* [`schema-control pull`](#schema-control-pull)
* [`schema-control sync`](#schema-control-sync)

## `schema-control apply`

apply an execution plan

```
USAGE
  $ schema-control apply

OPTIONS
  -c, --config=config  [default: schema/control.yml] path to config file
  -h, --help           show CLI help

EXAMPLE
  $ schema-control apply -c src/contract/_test_assets/control.yml
     ✔ [APPLY] ./tables/data_source.sql (change:table_20190626_1)
     ✔ [APPLY] ./tables/notification.sql (resource:table:notification)
     ↓ [MANUAL_MIGRATION] ./tables/notification_version.sql (resource:table:notification_version) [skipped]
     ✔ [REAPPLY] ./functions/find_message_hash_by_text.sql (resource:function:find_message_hash_by_text)
     ✔ [APPLY] ./procedures/upsert_message.sql (resource:procedure:upsert_message)
     ✔ [APPLY] ./init/data_sources.sql (change:init_20190619_1)
     ✖ [APPLY] ./init/service_user.sql (change:init_20190619_2)
       → Could not apply ./init/service_user.sql: Operation CREATE USER failed for…

  Could not apply ./init/service_user.sql: Operation CREATE USER failed for 'user_name'@'%'
```

_See code: [dist/contract/commands/apply.ts](https://github.com/uladkasach/schema-control/blob/v1.1.0/dist/contract/commands/apply.ts)_

## `schema-control help [COMMAND]`

display help for schema-control

```
USAGE
  $ schema-control help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src/commands/help.ts)_

## `schema-control plan`

generate and show an execution plan

```
USAGE
  $ schema-control plan

OPTIONS
  -c, --config=config  [default: schema/control.yml] path to config file
  -h, --help           show CLI help

EXAMPLE
  $ schema-control plan
    * [APPLY] ./init/service_user.sql (change:init_20190619_1)
       CREATE USER 'user_name'@'%';
       GRANT ALL PRIVILEGES ON awesomedb.* To 'user_name'@'%' IDENTIFIED BY '__CHANGE_M3__'; -- TODO: change password
```

_See code: [dist/contract/commands/plan.ts](https://github.com/uladkasach/schema-control/blob/v1.1.0/dist/contract/commands/plan.ts)_

## `schema-control pull`

pull and record uncontrolled resources

```
USAGE
  $ schema-control pull

OPTIONS
  -c, --config=config  [default: schema/control.yml] path to config file
  -h, --help           show CLI help
  -t, --target=target  [default: schema] target directory to record uncontrolled resources in

EXAMPLE
  $ schema-control pull -c src/contract/_test_assets/control.yml -t src/contract/_test_assets/uncontrolled
  pulling uncontrolled resource definitions into .../schema-control/src/contract/commands/_test_assets/uncontrolled
     ✓ [PULLED] resource:table:data_source
     ✓ [PULLED] resource:table:invitation
     ✓ [PULLED] resource:procedure:upsert_invitation
     ✓ [PULLED] resource:function:get_id_by_name
```

_See code: [dist/contract/commands/pull.ts](https://github.com/uladkasach/schema-control/blob/v1.1.0/dist/contract/commands/pull.ts)_

## `schema-control sync`

sync the change log for a specific change definition without applying it, for cases where a change has been reapplied manually

```
USAGE
  $ schema-control sync

OPTIONS
  -c, --config=config  [default: schema/control.yml] path to config file
  -h, --help           show CLI help
  --id=id              (required) reference id of the change definition

EXAMPLE
  $ schema-control sync -c src/contract/__test_assets__/control.yml --id change:init_service_user
     ✔ [SYNC] ./init/service_user.sql (change:init_service_user)
```

_See code: [dist/contract/commands/sync.ts](https://github.com/uladkasach/schema-control/blob/v1.1.0/dist/contract/commands/sync.ts)_
<!-- commandsstop -->


# Contribution

Team work makes the dream work! Please create a ticket for any features you think are missing and, if willing and able, draft a PR for the feature :)

## Testing
1. start the integration test db
  - *note: you will need docker and docker-compose installed for this to work*
  - `npm run integration-test-provision-db`
2. run the tests
  - `npm run test`

## Test Coverage
Test coverage is essential for maintainability, readability, and ensuring everything works! Anything not covered in tests is not guarenteed to work.

Test coverage:
- proves things work
- immensely simplifies refactoring (i.e., maintainability)
- encourages smaller, well scoped, more reusable, and simpler to understand modules (unit tests especially)
- encourages better coding patterns
- is living documentation for code, guaranteed to be up to date

#### Unit Tests
Unit tests should mock out all dependencies, so that we are only testing the logic in the immediate test. If we are not mocking out any of the imported functions, we are 1. testing that imported function (which should have its own unit tests, so this is redundant) and 2. burdening ourselfs with the considerations of that imported function - which slows down our testing as we now have to meet those constraints as well.

Note: Unit test coverage ensures that each function does exactly what you expect it to do (i.e., guarentees the contract). Compile time type checking (i.e., typescript) checks that we are using our dependencies correctly. When combined together, we guarentee that the contract we addition + compile time type checking guarentee that not only are we using our dependencies correctly but that our dependencies will do what we expect. This is a thorough combination.

`jest`

#### Integration Tests
Integration tests should mock _nothing_ - they should test the full lifecycle of the request and check that we get the expected response for an expected input. These are great to use at higher levels of abstraction - as well at the interface between an api (e.g., db connection or client).

`jest -c jest.integration.config.js`

## Patterns

Below are a few of the patterns that this project uses and the rational behind them.

- TypedObjects: every logical entity that is worked with in this project is represented by a typed object in order to formally define a ubiquitous language and enforce its usage throughout the code
- Contract - Logic - Data: this module formally distinguishes the contract layer, the logic layer, and the data layer:
  - The contract layer defines what we expose to users and under what requirements. This is where any input validation or output normalization occurs. This is where we think about minimizing the amount of things we expose - as each contract is something more to maintain.
  - The logic layer defines the domain logic / business logic that this module abstracts. This is where the heart of the module is and is where the magic happens. This layer is used by the contract layer to fulfill its promises and utilizes the data layer to persist data.
  - The data layer is a layer of abstraction that enables easy interaction with data sources and data stores (e.g., clients and databases). This module only uses the database.
- Utils -vs- Abstracting Complexity: abstracting complexity is important for maintainability and also for well scoped unit tests. We distinguish, in this project, two types of abstractions:
  - _utils are for modules that are completely domain independent and could easily be their own node module.
  - Otherwise, the module/function that you are abstracting into its own function should be a sibling module to the main module, under a directory with the name of the main module.
