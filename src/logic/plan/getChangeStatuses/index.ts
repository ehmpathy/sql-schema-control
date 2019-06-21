/*
  for each definition:
    1. get the hash
    2. check if the id is in the database
      - if in the database, check if hash has changed
        - if changed: OUT_OF_DATE
        - if not changed: UP_TO_DATE
      - if not in the database:
        - NOT_APPLIED

  in cli:
   color each of them differently
    - gray for UP_TO_DATE / SYNCED
    - green for NOT_APPLIED
    - yellow for OUT_OF_DATE and reappliable
    - red for OUT_OF_DATE and not reappliable

  and later, in the apply command:
    if UP_TO_DATE: do nothing
    if NOT APPLIED: apply
    if OUT_OF_DATE:
      - if reappliable: apply
      - if not reappliable: throw error
    and "apply" actualy means "executeAndLog"
*/
