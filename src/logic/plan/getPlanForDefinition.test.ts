import sha256 from 'simple-sha256';
import uuid from 'uuid/v4';

import { ChangeDefinition, ChangeDefinitionStatus, DefinitionPlan, RequiredAction } from '../../types';
import { getDifferenceForDefinition } from '../schema/getDifferenceForDefinition';
import { getReferenceIdForDefinition } from '../schema/getReferenceIdForDefinition';
import { getStatusForDefinition } from '../schema/getStatusForDefinition';
import { getPlanForDefinition } from './getPlanForDefinition';
import { getRequiredAction } from './getRequiredAction';

const exampleDefinition = new ChangeDefinition({
  id: uuid(),
  path: '__PATH__',
  sql: '__SQL__',
  hash: sha256.sync('__SQL__'),
  status: ChangeDefinitionStatus.UP_TO_DATE,
});

jest.mock('../schema/getStatusForDefinition');
const getStatusForDefinitionMock = getStatusForDefinition as jest.Mock;
getStatusForDefinitionMock.mockImplementation(({ definition }) => definition);

jest.mock('./getRequiredAction');
const getRequiredActionMock = getRequiredAction as jest.Mock;
getRequiredActionMock.mockReturnValue(RequiredAction.REAPPLY);

jest.mock('../schema/getDifferenceForDefinition');
const getDifferenceForDefinitionMock = getDifferenceForDefinition as jest.Mock;
getDifferenceForDefinitionMock.mockResolvedValue('__DIFF__');

jest.mock('../schema/getReferenceIdForDefinition');
const getReferenceIdForDefinitionMock = getReferenceIdForDefinition as jest.Mock;
getReferenceIdForDefinitionMock.mockReturnValue('__REFERENCE_ID__');

describe('getDefinitionPlan', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should get the status for the definition', async () => {
    await getPlanForDefinition({ connection: '__CONNECTION__' as any, definition: exampleDefinition });
    expect(getStatusForDefinitionMock).toHaveBeenCalledTimes(1);
    expect(getStatusForDefinitionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        definition: exampleDefinition,
      }),
    );
  });
  it('should get the required action', async () => {
    await getPlanForDefinition({ connection: '__CONNECTION__' as any, definition: exampleDefinition });
    expect(getRequiredActionMock).toHaveBeenCalledTimes(1);
    expect(getRequiredActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        definition: exampleDefinition,
      }),
    );
  });
  it('should get the diff', async () => {
    await getPlanForDefinition({ connection: '__CONNECTION__' as any, definition: exampleDefinition });
    expect(getDifferenceForDefinitionMock).toHaveBeenCalledTimes(1);
    expect(getDifferenceForDefinitionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        definition: exampleDefinition,
      }),
    );
  });
  it('should return the definition plan', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.UP_TO_DATE,
    });
    const plan = await getPlanForDefinition({ connection: '__CONNECTION__' as any, definition });
    expect(plan.constructor).toEqual(DefinitionPlan);
    expect(plan.id).toEqual('__REFERENCE_ID__'); // should have the id defined by the expected function
  });
});
