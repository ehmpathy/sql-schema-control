import {
  DatabaseConnection,
  ChangeDefinition,
  ChangeDefinitionStatus,
} from '../../../../types';
import { ChangeHasNotBeenAppliedError } from '../getAppliedChangeDefinitionFromDatabase/getAppliedChangeDefinitionFromDatabase';
import { getDifferenceForChangeDefinition } from '../getDifferenceForChangeDefinition/getDifferenceForChangeDefinition';

/*
for each definition:
  check if the id is in the database
  - if in the database, check if hash has changed
    - if changed: OUT_OF_DATE
    - if not changed: UP_TO_DATE
  - if not in the database:
    - NOT_APPLIED
*/
export const getStatusForChangeDefinition = async ({
  connection,
  change,
}: {
  connection: DatabaseConnection;
  change: ChangeDefinition;
}) => {
  try {
    const difference = await getDifferenceForChangeDefinition({
      connection,
      change,
    });
    if (difference === null) return ChangeDefinitionStatus.UP_TO_DATE;
    return ChangeDefinitionStatus.OUT_OF_DATE; // if difference is not null, then its out of date
  } catch (error) {
    if (error.constructor !== ChangeHasNotBeenAppliedError) throw error;
    return ChangeDefinitionStatus.NOT_APPLIED; // if the error said never applied exist, then this was not applied
  }
};
