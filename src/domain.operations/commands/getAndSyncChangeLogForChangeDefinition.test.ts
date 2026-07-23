import chalk from 'chalk';
import sha256 from 'simple-sha256';
import { stdout } from 'stdout-stderr';

import { ChangeDefinition } from '@src/domain';
import { getControlContextFromConfig } from '@src/domain.operations/config/getControlContextFromConfig';
import { syncChangeLogWithChangeDefinition } from '@src/domain.operations/schema/changeDefinition/syncChangelogWithChangeDefinition';

import { getAndSyncChangeLogForChangeDefinition } from './getAndSyncChangeLogForChangeDefinition';

jest.mock('../config/getControlContextFromConfig');
const getControlContextFromConfigMock =
  getControlContextFromConfig as jest.Mock;
const exampleContext = {
  connection: {
    end: jest.fn(),
  },
  definitions: [
    new ChangeDefinition({
      exid: '__EXID__',
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    }),
  ],
};
getControlContextFromConfigMock.mockResolvedValue(exampleContext);

jest.mock('../schema/changeDefinition/syncChangelogWithChangeDefinition');
const syncChangeLogWithChangeDefinitionMock =
  syncChangeLogWithChangeDefinition as jest.Mock;

describe('getAndDisplayPlans', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should get the control context from config', async () => {
    await getAndSyncChangeLogForChangeDefinition({
      configPath: '__CONFIG_PATH__',
      changeExid: '__EXID__',
    });
    expect(getControlContextFromConfigMock.mock.calls.length).toEqual(1);
    expect(getControlContextFromConfigMock.mock.calls[0][0]).toEqual({
      configPath: '__CONFIG_PATH__',
    });
  });
  it('should throw an error if no definition with the changeExid is found', async () => {
    try {
      await getAndSyncChangeLogForChangeDefinition({
        configPath: '__CONFIG_PATH__',
        changeExid: '__DIFFERENT_EXID__',
      });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toContain(
        'could not find a definition with referenceId',
      );
      expect(error.message).toMatchSnapshot();
    }
  });
  it('should syncChangeLogWithChangeDefinitionMock', async () => {
    await getAndSyncChangeLogForChangeDefinition({
      configPath: '__CONFIG_PATH__',
      changeExid: '__EXID__',
    });
    expect(syncChangeLogWithChangeDefinitionMock).toHaveBeenCalledTimes(1);
    expect(syncChangeLogWithChangeDefinitionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        definition: exampleContext.definitions[0],
      }),
    );
  });
  it('should close the connection', async () => {
    await getAndSyncChangeLogForChangeDefinition({
      configPath: '__CONFIG_PATH__',
      changeExid: '__EXID__',
    });
    expect(exampleContext.connection.end.mock.calls.length).toEqual(1);
  });
  it('should log that the change log was synced successfully', async () => {
    // setup env to monitor output
    stdout.stripColor = false; // dont strip color
    stdout.start();

    // run it
    await getAndSyncChangeLogForChangeDefinition({
      configPath: '__CONFIG_PATH__',
      changeExid: '__EXID__',
    });

    // check that output was expected
    stdout.stop();
    const output = stdout.output
      .split('\n')
      .filter((line) => !line.includes('console.log'))
      .join('\n'); // strip the console log portion
    expect(output).toContain(chalk.green('[SYNC]'));
    expect(output).toMatchSnapshot();
  });
});
