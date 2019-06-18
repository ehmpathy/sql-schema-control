# Schema Control

# Scope
Schema Control intends to simplify and automate, as much as possible, database schema management. 

# Installation

1. Save the package as a dev dependency
  ```sh
  npm install --save-dev schema-control
  ```

2. Define a node executable script that initializes the schema-control object with db connection and forwards cli arguments.

  ```ts
  // e.g., ./src/init/schema-control.ts

  const { promiseConfig } = './config';

  const promiseSchemaControl = async () => {
    const config = await promiseConfig();
    const dbConfig = config.database.admin;
    const schemaControl = new SchemaControl({
      host: dbConfig.host,
      port: dbConfig.port,
      schema: dbConfig.schema,
      username: dbConfig.user,
      password: dbConfig.pass,
    });
  }

  if (require.main === module) { // if this file was run directly, run the args against the cli interpreter
    (async () => {
      const arguments = process.argv.slice(2); // everything after second arg
      const schemaControl = await promiseSchemaControl();
      schemaControl.cli({ arguments }); // forward the arguments to the schema control handler
    })();
  }
  ```

3. add a shortcut for running the node executable in your package.json
  ```js
  // ...
  "scripts": {
    // ...
    "schema-control": "node ./dist/init/schema-control.js", // for the case where the contents of step two were defined in `./src/init/schema-control.ts`
    // ...
  },
  // ...
  ```

# Usage

Define your tables, models, stored procedures, functions, users, etc - however you like.

Each file of sql is considered a `resource`. We track whether or not each resource has been applied to the db by tracking the resource_id in a database we provision in your schema. We check whether or not applied resources have been updated by calculating the hash of each resource to check whether or not what is applied is up to date.

Senarios:
- add a stored procedure
- add a table
- modify a stored procedure
- modify a table - manual migration
- modify a table - automatic migration
  - COMMING SOON


## Plan Changes
See what resources need to be applied to the database OR what resources exist in the database but are not defined in your checked-in resource definitions.

```
npm run schema-control -- plan
```

SchemaControl compares the resources defined by your `resources.yml` file against the state of the database. Using DDL-to-JSON conversion, we compare the contents of the database (e.g., `SHOW CREATE ...` for each table, function, etc) against the resources defined.

###### possible resource states
- *NOT_APPLIED*: a checked-in resource does not exist in the database
  - explanation:
    - i.e., you checked in a new resource and have not applied it
  - resolution:
    - `npm run schema-control -- apply`
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
    - `npm run schema-control -- apply` if you updated the resource definition
    - `npm run schema-control -- pull` if you manually applied a change and want to check it in
- *NOT_CHECKED_IN*: a resource exists in the database but is not checked in
  - explanation
    - e.g., a manual change was applied to the database
  - resolution:
    - `npm run schema-control -- pull`

As you can see, the results of `schema-control plan` are based on comparing the checked in resource definitions with the resource definitions live in the database. A resource is guaranteed to be in one of these states.

## Pull Changes
Retrieve the definition of a resource from the database so you can save it into your checked-in resources.

```
npm run schema-control -- pull -d ./schema/.tmp/pull_results
```

SchemaControl simply retrieves the create definition for the resource and saves it into a file. The directory to save that file to must be specified with the `into-directory` argument.

By default, SchemaControl separates each type of resource into their own directories. This also means that if you are following the resource directory definition laid out by SchemaControl, you may simply pull changes directly into your source resource definitions directory. In fact, this is a good way of migrating to SchemaControl - as you can initialize your resource definitions directory in this way (e.g., `npm run schema-control -- pull -d ./schema`)

###### arguments
- `-d` or `--into-directory`: specify the directory into which to pull the resource definitions


## Apply Changes
Apply *NOT_APPLIED* and, if specified, *OUT_OF_SYNC* resource definitions. In other words, run the resource definition sql if the resource is in one of the above states.

To apply only *NOT_APPLIED* resource definitions:
```
npm run schema-control -- apply
```

To apply both *NOT_APPLIED* and *OUT_OF_SYNC* resource definitions:
```
npm run schema-control -- apply --and-update
```

Applying *NOT_APPLIED* resource definitions is simple: we're creating new resources and just need to run the sql.

Applying *OUT_OF_SYNC* resource definitions can be more complicated depending on the resource type.
- For stored procedures, functions, views, and other resources that can be drop and replaced, applying the resource definitions again to get the database in sync with the checked-in definition is sufficient (as long as `CREATE OR REPLACE` or the analog is included in the resource definition).
- For tables and other resources that can not simply be dropped and recreated, a migration must be conducted to sync the states. SchemaControl does not currently support applying migrations, so these must be conducted manually. SchemaControl will, however, define what is out of sync between your checked-in resource definition and the definition live in the database.
