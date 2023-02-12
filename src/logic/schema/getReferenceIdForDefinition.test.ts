import sha256 from 'simple-sha256';

import { uuid } from '../../deps';
import {
  ChangeDefinition,
  ChangeDefinitionStatus,
  ResourceDefinition,
  ResourceType,
} from '../../types';
import { getReferenceIdForDefinition } from './getReferenceIdForDefinition';

describe('getReferenceIdForDefinition', () => {
  it('should accurately define the plan id for a change definition', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.UP_TO_DATE,
    });
    const referenceId = getReferenceIdForDefinition({ definition });
    expect(referenceId).toEqual(`change:${definition.id}`);
  });
  it('should accurately define the plan id for a resource definition', async () => {
    const definition = new ResourceDefinition({
      path: '__PATH__',
      sql: '__SQL__',
      type: ResourceType.PROCEDURE,
      name: '__PROCEDURE_NAME__',
    });
    const referenceId = getReferenceIdForDefinition({ definition });
    expect(referenceId).toEqual('resource:procedure:__PROCEDURE_NAME__');
  });
});
