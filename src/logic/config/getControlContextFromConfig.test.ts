import sha256 from 'simple-sha256';
import { DatabaseLanguage, ControlContext, ChangeDefinition, DefinitionType } from '../../types';
import { getControlContextFromConfig } from './getControlContextFromConfig';
import { getConfig } from './getConfig';
import { initializeControlEnvironment } from './initializeControlEnvironment';
import { getStatus } from '../definitions/getStatus';

jest.mock('./getConfig');
const getConfigMock = getConfig as jest.Mock;
const mockedConfigResponse = {
  language: DatabaseLanguage.MYSQL,
  dialect: '__DIALECT__',
  connection: '__CONNECTION__',
  definitions: [
    new ChangeDefinition({
      type: DefinitionType.CHANGE,
      path: '__PATH__',
      id: '__ID_ONE__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    }),
    new ChangeDefinition({
      type: DefinitionType.CHANGE,
      path: '__PATH__',
      id: '__ID_TWO__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    }),
  ],
};
getConfigMock.mockResolvedValue(mockedConfigResponse); // since typechecked by Context object

jest.mock('./initializeControlEnvironment');
const initializeControlEnvironmentMock = initializeControlEnvironment as jest.Mock;
const exampleConnection = { query: () => {}, end: () => {} };
initializeControlEnvironmentMock.mockResolvedValue({ connection: exampleConnection }); // since typechecked by Context object

jest.mock('../definitions/getStatus');
const getStatusMock = getStatus as jest.Mock;
getStatusMock.mockImplementation(({ definition }) => definition); // pass back what was given

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
  it('should get the status of each definition', async () => {
    await getControlContextFromConfig({ configPath: '__CONFIG_PATH__' });
    expect(getStatusMock.mock.calls.length).toEqual(2);
    expect(getStatusMock.mock.calls[0][0]).toEqual({ connection: exampleConnection, definition: mockedConfigResponse.definitions[0] });
    expect(getStatusMock.mock.calls[1][0]).toEqual({ connection: exampleConnection, definition: mockedConfigResponse.definitions[1] });
  });
  it('should return a control context', async () => {
    getConfigMock.mockResolvedValueOnce({ language: DatabaseLanguage.MYSQL, dialect: '__DIALECT__', connection: '__CONNECTION__', definitions: [] }); // since typechecked by Context object
    initializeControlEnvironmentMock.mockResolvedValueOnce({ query: () => {}, end: () => {} }); // since typechecked by Context object
    const result = await getControlContextFromConfig({ configPath: '__CONFIG_PATH__' });
    expect(result.constructor).toEqual(ControlContext);
  });
});
