import uuid from 'uuid/v4';
import sha256 from 'simple-sha256';
import { ChangeDefinition, DefinitionType, ChangeDefinitionStatus, DefinitionPlan, RequiredAction } from '../../types';
import { getDefinitionPlan } from './getDefinitionPlan';
import { getRequiredAction } from './getRequiredAction';
import { getDifference } from './getDifference';

jest.mock('./getRequiredAction');
const getRequiredActionMock = getRequiredAction as jest.Mock;
getRequiredActionMock.mockReturnValue(RequiredAction.REAPPLY);

jest.mock('./getDifference');
const getDifferenceMock = getDifference as jest.Mock;
getDifferenceMock.mockResolvedValue('__DIFF__');

describe('getDefinitionPlan', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should get the required action', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.UP_TO_DATE,
    });
    await getDefinitionPlan({ connection: '__CONNECTION__' as any, definition });
    expect(getRequiredActionMock.mock.calls.length).toEqual(1);
    expect(getRequiredActionMock.mock.calls[0][0]).toEqual({
      definition,
    });
  });
  it('should get the change diff', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.UP_TO_DATE,
    });
    await getDefinitionPlan({ connection: '__CONNECTION__' as any, definition });
    expect(getDifferenceMock.mock.calls.length).toEqual(1);
    expect(getDifferenceMock.mock.calls[0][0]).toEqual({
      connection: '__CONNECTION__',
      definition,
    });
  });
  it('should return the definition plan', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.UP_TO_DATE,
    });
    const plan = await getDefinitionPlan({ connection: '__CONNECTION__' as any, definition });
    expect(plan.constructor).toEqual(DefinitionPlan);
  });
});
