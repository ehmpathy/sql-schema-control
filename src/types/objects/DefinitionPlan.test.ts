import { DefinitionType, RequiredAction } from '../constants';
import { ChangeDefinition } from './ChangeDefinition';
import { DefinitionPlan } from './DefinitionPlan';
import sha256 from 'simple-sha256';

describe('DefinitionPlan', () => {
  const changeDefinition = new ChangeDefinition({
    type: DefinitionType.CHANGE,
    id: 'cool_change_20190619_1',
    sql: '__SQL__',
    hash: sha256.sync('__SQL__'),
  });
  it('should initialize for valid inputs', () => {
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
});
