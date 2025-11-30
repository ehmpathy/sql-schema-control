import {
  ChangeDefinition,
  type DatabaseConnection,
  ResourceDefinition,
} from '../../domain';
import { getDifferenceForChangeDefinition } from './changeDefinition/getDifferenceForChangeDefinition';
import { getDifferenceForResourceDefinition } from './resourceDefinition/getDifferenceForResourceDefinition';

export const getDifferenceForDefinition = async ({
  connection,
  definition,
}: {
  connection: DatabaseConnection;
  definition: ChangeDefinition | ResourceDefinition;
}) => {
  if (definition instanceof ChangeDefinition) {
    return await getDifferenceForChangeDefinition({
      connection,
      change: definition,
    });
  }
  if (definition instanceof ResourceDefinition) {
    return await getDifferenceForResourceDefinition({
      connection,
      resource: definition,
    });
  }
  throw new Error(
    'unsupported controlled definition. this is an internal schema-generator error',
  );
};
