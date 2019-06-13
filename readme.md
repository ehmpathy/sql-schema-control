# Schema Control

## Scope
Schema Control intends to simplify and automate, as much as possible, database schema managment. This project takes inspiration from the liquibase project.

## Installation

```
npm install schema-control
```

## Usage

Define your tables, models, stored procedures, functions, users, etc - however you like.

Each file of sql is considered a `resource`. We track whether or not each resource has been applied to the db by tracking the resource_id in a database we provision in your schema. We check whether or not applied resources have been updated by calculating the hash of each resource to check whether or not what is applied is up to date.

Senarios:
- add a stored procedure
- add a table
- modify a stored procedure
- modify a table - manual migration
- modify a table - automatic migration
  - COMMING SOON
