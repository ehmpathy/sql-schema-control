import { DatabaseLanguage, ControlContext } from '../../types';
import { getControlContextFromConfig } from './getControlContextFromConfig';
import { getConfig } from './getConfig';
import { initializeControlEnvironment } from './initializeControlEnvironment';

jest.mock('./getConfig');
const getConfigMock = getConfig as jest.Mock;
const mockedConfigResponse = { language: DatabaseLanguage.MYSQL, dialect: '__DIALECT__', connection: '__CONNECTION__', definitions: [] };
getConfigMock.mockResolvedValue(mockedConfigResponse); // since typechecked by Context object

jest.mock('./initializeControlEnvironment');
const initializeControlEnvironmentMock = initializeControlEnvironment as jest.Mock;
initializeControlEnvironmentMock.mockResolvedValue({ query: () => {}, end: () => {} }); // since typechecked by Context object

describe('getControlContextFromConfig', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should get the config from the file path defined', async () => {
    await getControlContextFromConfig({ configPath: '__CONFIG_PATH__' });
    expect(getConfigMock.mock.calls.length).toEqual(1);
    expect(getConfigMock.mock.calls[0][0]).toMatchObject({
      configPath: '__CONFIG_PATH__',
    });
  });
  it('should initialize the control environment', async () => {
    await getControlContextFromConfig({ configPath: '__CONFIG_PATH__' });
    expect(initializeControlEnvironmentMock.mock.calls.length).toEqual(1);
    expect(initializeControlEnvironmentMock.mock.calls[0][0]).toMatchObject({
      config: mockedConfigResponse,
    });
  });
  it('should return a control context', async () => {
    getConfigMock.mockResolvedValueOnce({ language: DatabaseLanguage.MYSQL, dialect: '__DIALECT__', connection: '__CONNECTION__', definitions: [] }); // since typechecked by Context object
    initializeControlEnvironmentMock.mockResolvedValueOnce({ query: () => {}, end: () => {} }); // since typechecked by Context object
    const result = await getControlContextFromConfig({ configPath: '__CONFIG_PATH__' });
    expect(result.constructor).toEqual(ControlContext);
  });
});
