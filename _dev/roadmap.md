0. read control.yml
  - recursive read yml (i.e., if path ends with yml, open the yml and extend the orig yml)
  - extract language, connection, and commands
  - validate the commands
    - i.e., generate list of invalid commands
      - e.g., missing id, invalid file path, etc
  - validate the connection
    - i.e., attempt to connect to the db

0. provision change set managment table
  - if table DNE, create table

Changes:
1. plan changes
  1. calculate hash of each change set
  2. get status of each change set

2. apply changes
  1. for all NOT_APPLIED, apply
  2. for all OUT_OF_DATE and reapplyOnUpdate=true, apply

3. record change applied
  `npx schema-control record --applied --change-set-id '__CHANGE_SET_ID__'`

Resources:
1. plan resources
  0. evaluate DDL and DCL resources with checked-in definitions
		1. understand resource type
		2. understand resource name
  0. evaluate DDL and DCL resources live in database   (e.g., SHOW CREATE && SHOW GRANTS)
		1. understand resource type
		2. understand resource name
	2. define STATUS of resource:
    - compare CREATE statement against resource definition
			- if CREATE TABLE, compare by AST
			- if SPROC or FUNCTION, compare by exact string match
			- else, compare by exact string match
  3. return status for each resource

2. pull resources
  0. for each resource in NOT_CHECKED_IN state:
    1. get the create statement
    2. save to file in target directory

3. push resources
  0. for each resource in NOT_APPLIED state:
    1. run the resource definition
  0. for each resource in OUT_OF_SYNC state:
    1. run the resource definition if `--and-update` is defined
