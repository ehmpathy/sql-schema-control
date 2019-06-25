schema-control
==============

Database schema management and control. Provision, sync, update, and migrate your database from version controlled resource configs.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/schema-control.svg)](https://npmjs.org/package/schema-control)
[![Codecov](https://codecov.io/gh/uladkasach/schema-control/branch/master/graph/badge.svg)](https://codecov.io/gh/uladkasach/schema-control)
[![Downloads/week](https://img.shields.io/npm/dw/schema-control.svg)](https://npmjs.org/package/schema-control)
[![License](https://img.shields.io/npm/l/schema-control.svg)](https://github.com/uladkasach/schema-control/blob/master/package.json)

# Table of Contents
<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
* [Scope](#scope)
* [Contribution](#contribution)
<!-- tocstop -->


# Usage

1. Save the package as a dev dependency
  ```sh
  npm install --save-dev schema-control
  ```

2. Define the database connection that schema-control can use
  ```ts
  // e.g., ./schema/control.connection.js

  const { promiseConfig } = './config';

  const promiseSchemaControlConfig = async () => {
    const config = await promiseConfig();
    const dbConfig = config.database.admin; // NOTE: schema control must have DDL privileges
    const schemaControlConfig = {
      host: dbConfig.host,
      port: dbConfig.port,
      schema: dbConfig.schema,
      username: dbConfig.user,
      password: dbConfig.pass,
    };
  };

  export {
    promiseSchemaControlConfig as promiseConfig, // NOTE: schema-control will look for an export named `promiseConfig`
  }
  ```

4. Define a config yml
  ```yml
    # e.g., ./schema/control.yml
    language: mysql
    dialect: 5.7
    connection: ./control.connection.js
    definitions:
      - ./changes.yml
      - ./resources.yml
  ```

# Commands
<!-- commands -->
* [`schema-control hello [FILE]`](#schema-control-hello-file)
* [`schema-control help [COMMAND]`](#schema-control-help-command)

## `schema-control hello [FILE]`

describe the command here

```
USAGE
  $ schema-control hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ schema-control hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/uladkasach/schema-control/blob/v0.0.0/src/commands/hello.ts)_

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
<!-- commandsstop -->


# Scope
Schema Control intends to simplify, automate, and clarify, as much as possible, database schema management.

This includes:
- DDL and DCL management
  - including migrations
- Database Resource Syncing
  - e.g., tables, sprocs, etc
- Provisioning Data and Non-Standard Resources
  - e.g., initial data
  - e.g., resource definitions that are not yet fully supported

And Enables:
- Eliminating manual DDL and DCL queries and manual data provisioning
- Database management in CICD
- Automatically provisioning databases for integration testing
- Guarantees that all database resources are checked into code

This project takes inspiration from Liquibase and Terraform.


# Old-Usage

Schema Control operates on two schema management classes: changes and resources.

Changes are simply sets of sql statements that you wish to apply to the database. Everything can be done with changes - and schema-control simply tracks whether each change has been applied and whether it is still up to date (i.e., comparing the hash).    

Resources are DDL created entities that we can track and "sync" with your checked in code. SchemaControl is able to detect resources in your live database that are not checked into your code, resources that have not been added to your database, and resources that are out of sync between the definition in your code and what lives in your database - as well as specifying how exactly they are out of sync.

*NOTE: by default schema-control assumes that your `config.yml` lives in `./schema/control.yml`. Specify alternative with the `-c` argument*

## Plan Changes and Resources
See the status of the changes and resources defined in control config, as well as any resources live in the database but not checked into resource definitions.

```
npx schema-control plan
```

SchemaControl compares the resources defined by your `resources.yml` file against the state of the database. Using DDL-to-JSON conversion, we compare the contents of the database (e.g., `SHOW CREATE ...` for each table, function, etc) against the resources defined.


###### possible *change* states
- *NOT_APPLIED*: a checked in change has not been applied to db yet
  - explanation:
    - i.e., you checked in a new change and have not applied it
  - resolution:
    - `npx schema-control apply`
- *UP_TO_DATE*: a checked in change has been applied to db and has the same contents as what was applied
  - explanation:
    - i.e., the change has not been altered since the last time it was applied
  - resolution:
    - `echo 'all done'`: nothing to do - this is what we want!
- *OUT_OF_DATE*: a checked in change has been applied but the contents of this change and the one that was applied are different
  - explanation:
    - i.e., the change definition was modified since it was last applied
  - resolution:
    - `npm run schema-control apply --and-update`

###### possible *resource* states
- *NOT_APPLIED*: a checked-in resource does not exist in the database
  - explanation:
    - i.e., you checked in a new resource and have not applied it
  - resolution:
    - `npx schema-control apply`
- *SYNCED*: a checked-in resource exists in the database and the state is in sync with the resource definition
  - explanation:
    - i.e., the resource has not been altered since the last time it was checked-in
  - resolution:
    - `echo 'all done'`: nothing to do - this is what we want!
- *OUT_OF_SYNC*: a checked-in resource exists in the database and the state is not in sync with the resource definition
  - explanation:
    - e.g., you updated the definition of a resource
    - e.g., you manually applied a change to the resource in the database but did not check the change in
  - resolution:
    - `npx schema-control apply --and-update` if you updated the resource definition
    - `npx schema-control pull` if you manually applied a change and want to check it in
- *NOT_CHECKED_IN*: a resource exists in the database but is not checked in
  - explanation
    - e.g., a manual change was applied to the database
  - resolution:
    - `npx schema-control pull`

As you can see, the results of `schema-control plan` are based on comparing the checked in resource definitions with the resource definitions live in the database. A resource is guaranteed to be in one of these states.

## Pull Resources
Retrieve the definition of a resource from the database so you can save it into your checked-in resources.

```
npx schema-control pull -d ./schema/.tmp/pull_results
```

SchemaControl simply retrieves the create definition for the resource and saves it into a file. The directory to save that file to must be specified with the `into-directory` argument.

By default, SchemaControl separates each type of resource into their own directories. This also means that if you are following the resource directory definition laid out by SchemaControl, you may simply pull changes directly into your source resource definitions directory. In fact, this is a good way of migrating to SchemaControl - as you can initialize your resource definitions directory in this way (e.g., `npx schema-control pull -d ./schema`)

###### arguments
- `-d` or `--into-directory`: specify the directory into which to pull the resource definitions


## Apply Changes and Resources
Apply *NOT_APPLIED* and, if specified, *OUT_OF_DATE* change and *OUT_OF_SYNC* resource definitions. In other words, run the resource definition sql if the resource is in one of the above states.

To apply only *NOT_APPLIED* resource definitions:
```
npx schema-control apply
```

To apply both *NOT_APPLIED*, reappliable *OUT_OF_DATE* command definitions, as well as replaceable *OUT_OF_SYNC* resource definitions:
```
npx schema-control apply --and-update
```

Applying *NOT_APPLIED* resource definitions is simple: we're creating new resources or have changes that were not applied and just need to run the sql.

Applying *OUT_OF_DATE* resource definitions is possible only when the user explicitly defines that we can reappliable.
- If a change can not be reapplied on update, then the user must manually make the change and ask schema-control to update the applied hash manually: `npx schema-control record --applied --change-id '__CHANGE_SET_ID__'`

Applying *OUT_OF_SYNC* resource definitions can be more complicated depending on the resource type.
- For stored procedures, functions, views, and other resources that can be drop and replaced, applying the resource definitions again to get the database in sync with the checked-in definition is sufficient (as long as `CREATE OR REPLACE` or the analog is included in the resource definition).
- For tables and other resources that can not simply be dropped and recreated, a migration must be conducted to sync the states. SchemaControl does not currently support applying migrations, so these must be conducted manually. SchemaControl will, however, define what is out of sync between your checked-in resource definition and the definition live in the database.


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
