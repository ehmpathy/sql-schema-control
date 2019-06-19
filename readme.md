# Schema Control

# Scope
Schema Control intends to simplify and automate, as much as possible, database schema management.

This project takes inspiration from Liquibase and Terraform.

# Installation

1. Save the package as a dev dependency
  ```sh
  npm install --save-dev schema-control
  ```

2. Define the connection that schema-control can use
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
    language: mysql5.7
    connection: ./control.connection.js
    changes:
      - ./changes.yml
    resources:
      - ./resources.yml
  ```

3. add a shortcut for running the node executable in your package.json
  ```js
  // ...
  "scripts": {
    // ...
    "schema-control": "npx schema-control -c ./schema/control.yml",
    // ...
  },
  // ...
  ```

# Usage

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
- *NOT_APPLIED*: a checked in change set has not been applied to db yet
  - explanation:
    - i.e., you checked in a new change set and have not applied it
  - resolution:
    - `npx schema-control apply`
- *UP_TO_DATE*: a checked in change set has been applied to db and has the same contents as what was applied
  - explanation:
    - i.e., the change set has not been altered since the last time it was applied
  - resolution:
    - `echo 'all done'`: nothing to do - this is what we want!
- *OUT_OF_DATE*: a checked in change set has been applied but the contents of this change set and the one that was applied are different
  - explanation:
    - i.e., the change set definition was modified since it was last applied
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
Apply *NOT_APPLIED* and, if specified, *OUT_OF_DATE* change set and *OUT_OF_SYNC* resource definitions. In other words, run the resource definition sql if the resource is in one of the above states.

To apply only *NOT_APPLIED* resource definitions:
```
npx schema-control apply
```

To apply both *NOT_APPLIED*, reapplyOnUpdate-able *OUT_OF_DATE* command set definitinos, as well as replaceable *OUT_OF_SYNC* resource definitions:
```
npx schema-control apply --and-update
```

Applying *NOT_APPLIED* resource definitions is simple: we're creating new resources or have change sets that were not applied and just need to run the sql.

Applying *OUT_OF_DATE* resource definitions is possible only when the user explicitly defines that we can reapplyOnUpdate.
- If a change set can not be reapplied on update, then the user must manually make the change and ask schema-control to update the applied hash manually: `npx schema-control record --applied --change-set-id '__CHANGE_SET_ID__'`

Applying *OUT_OF_SYNC* resource definitions can be more complicated depending on the resource type.
- For stored procedures, functions, views, and other resources that can be drop and replaced, applying the resource definitions again to get the database in sync with the checked-in definition is sufficient (as long as `CREATE OR REPLACE` or the analog is included in the resource definition).
- For tables and other resources that can not simply be dropped and recreated, a migration must be conducted to sync the states. SchemaControl does not currently support applying migrations, so these must be conducted manually. SchemaControl will, however, define what is out of sync between your checked-in resource definition and the definition live in the database.
