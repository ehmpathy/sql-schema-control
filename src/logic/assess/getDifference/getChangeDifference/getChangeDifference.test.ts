import uuid from 'uuid/v4';
import sha256 from 'simple-sha256';
import { ChangeDefinition, DefinitionType, ChangeDefinitionStatus } from '../../../../types';
import { getChangeDifference } from './getChangeDifference';
import { getOutOfDateDifference } from './getOutOfDateDifference';
import { getNotAppliedDifference } from './getNotAppliedDifference';

jest.mock('./getOutOfDateDifference');
const getOutOfDateDifferenceMock = getOutOfDateDifference as jest.Mock;
getOutOfDateDifferenceMock.mockResolvedValue('__OUT_OF_DATE_DIFF__');

jest.mock('./getNotAppliedDifference');
const getNotAppliedDifferenceMock = getNotAppliedDifference as jest.Mock;
getNotAppliedDifferenceMock.mockResolvedValue('__NOT_APPLIED_DIFF__');

describe('getChangeDifference', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should throw an error if there is no status on the ChangeDefinition', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    });
    try {
      await getChangeDifference({ connection: {} as any, change: definition });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual('status must be defined to determine difference');
    }
  });
  it('should return null if change.status = UP_TO_DATE', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.UP_TO_DATE,
    });
    const diff = await getChangeDifference({ connection: {} as any, change: definition });
    expect(diff).toEqual(null);
  });
  it('should return the result of getOutOfDateDifference for change.status = OUT_OF_DATE', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.OUT_OF_DATE,
    });
    const diff = await getChangeDifference({ connection: '__CONNECTION__' as any, change: definition });
    expect(getOutOfDateDifferenceMock.mock.calls.length).toEqual(1);
    expect(getOutOfDateDifferenceMock.mock.calls[0][0]).toEqual({
      connection: '__CONNECTION__',
      change: definition,
    });
    expect(diff).toEqual('__OUT_OF_DATE_DIFF__');
  });
  it('should return the result of getNotAppliedDifference for change.status = NOT_APPLIED', async () => {
    const definition = new ChangeDefinition({
      id: uuid(),
      type: DefinitionType.CHANGE,
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
      status: ChangeDefinitionStatus.NOT_APPLIED,
    });
    const diff = await getChangeDifference({ connection: {} as any, change: definition });
    expect(getNotAppliedDifferenceMock.mock.calls.length).toEqual(1);
    expect(getNotAppliedDifferenceMock.mock.calls[0][0]).toEqual({
      change: definition,
    });
    expect(diff).toEqual('__NOT_APPLIED_DIFF__');
  });
});
