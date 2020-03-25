import sha256 from 'simple-sha256';

import { getControlContextFromConfig } from '../config/getControlContextFromConfig';
import { getAndSyncChangeLogForChangeDefinition } from './getAndSyncChangeLogForChangeDefinition';
import { ChangeDefinition } from '../../types';
import { syncChangeLogWithChangeDefinition } from '../schema/changeDefinition/syncChangelogWithChangeDefinition';
import { stdout } from 'stdout-stderr';
import chalk from 'chalk';

jest.mock('../config/getControlContextFromConfig');
const getControlContextFromConfigMock = getControlContextFromConfig as jest.Mock;
const exampleContext = {
  connection: {
    end: jest.fn(),
  },
  definitions: [
    new ChangeDefinition({
      id: '__ID__',
      path: '__PATH__',
      sql: '__SQL__',
      hash: sha256.sync('__SQL__'),
    }),
  ],
};
getControlContextFromConfigMock.mockResolvedValue(exampleContext);

jest.mock('../schema/changeDefinition/syncChangelogWithChangeDefinition');
const syncChangeLogWithChangeDefinitionMock = syncChangeLogWithChangeDefinition as jest.Mock;

describe('getAndDisplayPlans', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should get the control context from config', async () => {
    await getAndSyncChangeLogForChangeDefinition({ configPath: '__CONFIG_PATH__', changeId: '__ID__' });
    expect(getControlContextFromConfigMock.mock.calls.length).toEqual(1);
    expect(getControlContextFromConfigMock.mock.calls[0][0]).toEqual({
      configPath: '__CONFIG_PATH__',
    });
  });
  it('should throw an error if no definition with the changeId is found', async () => {
    try {
      await getAndSyncChangeLogForChangeDefinition({
        configPath: '__CONFIG_PATH__',
        changeId: 'change:__DIFFERENT_ID__',
      });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toContain('could not find a definition with referenceId');
    }
  });
  it('should syncChangeLogWithChangeDefinitionMock', async () => {
    await getAndSyncChangeLogForChangeDefinition({ configPath: '__CONFIG_PATH__', changeId: '__ID__' });
    expect(syncChangeLogWithChangeDefinitionMock).toHaveBeenCalledTimes(1);
    expect(syncChangeLogWithChangeDefinitionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        definition: exampleContext.definitions[0],
      }),
    );
  });
  it('should close the connection', async () => {
    await getAndSyncChangeLogForChangeDefinition({ configPath: '__CONFIG_PATH__', changeId: '__ID__' });
    expect(exampleContext.connection.end.mock.calls.length).toEqual(1);
  });
  it('should log that the change log was synced successfully', async () => {
    // setup env to monitor output
    stdout.stripColor = false; // dont strip color
    stdout.start();

    // run it
    await getAndSyncChangeLogForChangeDefinition({ configPath: '__CONFIG_PATH__', changeId: '__ID__' });

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
