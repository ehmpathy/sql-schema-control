import { initializeControlEnvironment } from './initializeControlEnvironment';
import { connectToDatabase } from './connectToDatabase';
import { provisionChangeLogTable } from './provisionChangeLogTable';

jest.mock('./connectToDatabase');
const connectToDatabaseMock = connectToDatabase as jest.Mock;
connectToDatabaseMock.mockResolvedValue('__CONNECTION__');

jest.mock('./provisionChangeLogTable');
const provisionChangeLogTableMock = provisionChangeLogTable as jest.Mock;

describe('initializeControlEnvironment', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should conenct to the database', async () => {
    await initializeControlEnvironment({ config: '__CONFIG__' as any });
    expect(connectToDatabaseMock.mock.calls.length).toEqual(1);
    expect(connectToDatabaseMock.mock.calls[0][0]).toMatchObject({
      config: '__CONFIG__',
    });
  });
  it('should provision the change log table', async () => {
    await initializeControlEnvironment({ config: '__CONFIG__' as any });
    expect(provisionChangeLogTableMock.mock.calls.length).toEqual(1);
    expect(provisionChangeLogTableMock.mock.calls[0][0]).toMatchObject({
      connection: '__CONNECTION__',
    });
  });
  it('should return the database connection', async () => {
    const result = await initializeControlEnvironment({ config: '__CONFIG__' as any });
    expect(result).toHaveProperty('connection');
    expect(result.connection).toEqual('__CONNECTION__');
  });
});
