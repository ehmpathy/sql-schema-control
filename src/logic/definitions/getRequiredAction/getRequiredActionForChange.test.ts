import sha256 from 'simple-sha256';
import { ChangeDefinitionStatus, ChangeDefinition, RequiredAction } from '../../../types';
import { getRequiredActionForChange } from './getRequiredActionForChange';

describe('getRequiredActionForChange', () => {
  it('should find no change required for change definition with status UP_TO_DATE', () => {
    const definition = new ChangeDefinition({
      id: '__ID__',
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.UP_TO_DATE,
    });
    const action = getRequiredActionForChange({ definition });
    expect(action).toEqual(RequiredAction.NO_CHANGE);
  });
  it('should find apply required for change with status NOT_APPLIED', () => {
    const definition = new ChangeDefinition({
      id: '__ID__',
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.NOT_APPLIED,
    });
    const action = getRequiredActionForChange({ definition });
    expect(action).toEqual(RequiredAction.APPLY);
  });
  it('should find reapply required for change with status OUT_OF_DATE when reappliable', () => {
    const definition = new ChangeDefinition({
      id: '__ID__',
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.OUT_OF_DATE,
      reappliable: true,
    });
    const action = getRequiredActionForChange({ definition });
    expect(action).toEqual(RequiredAction.REAPPLY);
  });
  it('should find manual_reapply required for change with status OUT_OF_DATE when not reappliable', () => {
    const definition = new ChangeDefinition({
      id: '__ID__',
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.OUT_OF_DATE,
      reappliable: false,
    });
    const action = getRequiredActionForChange({ definition });
    expect(action).toEqual(RequiredAction.MANUAL_REAPPLY);
  });
});
