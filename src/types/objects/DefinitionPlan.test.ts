import { RequiredAction, ResourceType } from '../constants';
import { ChangeDefinition } from './ChangeDefinition';
import { ResourceDefinition } from './ResourceDefinition';
import { DefinitionPlan } from './DefinitionPlan';
import sha256 from 'simple-sha256';

describe('DefinitionPlan', () => {
  const changeDefinition = new ChangeDefinition({
    id: 'cool_change_20190619_1',
    path: '__PATH__',
    sql: '__SQL__',
    hash: sha256.sync('__SQL__'),
  });
  const resourceDefinition = new ResourceDefinition({
    path: '__SOME_PATH__',
    sql: '__SQL__',
    name: '__NAME__',
    type: ResourceType.FUNCTION,
  });
  it('should initialize for valid inputs - change definition', () => {
    const plan = new DefinitionPlan({
      definition: changeDefinition,
      difference: 'some difference',
      action: RequiredAction.APPLY,
    });
    expect(plan).toMatchObject({
      definition: changeDefinition,
      action: RequiredAction.APPLY,
      difference: 'some difference',
    });
  });
  it('should initialize for valid inputs - resource definition', () => {
    const plan = new DefinitionPlan({
      definition: resourceDefinition,
      difference: 'some difference',
      action: RequiredAction.APPLY,
    });
    expect(plan).toMatchObject({
      definition: resourceDefinition,
      difference: 'some difference',
      action: RequiredAction.APPLY,
    });
  });
});
