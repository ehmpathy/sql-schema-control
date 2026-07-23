import { ChangeDefinition, DefinitionType } from '@src/domain';
import { InvalidDefinitionError } from '@src/domain.operations/config/getConfig/readConfig/validateAndHydrateDefinitionsYmlContents/errors';

import { readFileAsync } from './../../../../_utils/readFileAsync';
import { hydrateChangeDefinitionContent } from './hydrateChangeDefinitionContent';

jest.mock('./../../../../_utils/readFileAsync');
const readFileAsyncMock = readFileAsync as jest.Mock;
readFileAsyncMock.mockResolvedValue('__SQL_CONTENTS__');

describe('hydrate change definition content', () => {
  it('should throw an error if the path is not defiend', async () => {
    try {
      await hydrateChangeDefinitionContent({
        readRoot: '__READ_ROOT__',
        content: {},
      });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.constructor).toEqual(InvalidDefinitionError);
      expect(error.explanation).toEqual('path must be defined');
    }
  });
  it('should throw an error if the extension is not .sql', async () => {
    try {
      await hydrateChangeDefinitionContent({
        readRoot: '__READ_ROOT__',
        content: { path: 'somefile.json' },
      });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.constructor).toEqual(InvalidDefinitionError);
      expect(error.explanation).toEqual('path must specify a .sql file');
    }
  });
  it('should get the sql content from the path', async () => {
    const exampleContent = {
      type: DefinitionType.CHANGE,
      id: '__ID__',
      path: '__FILE_PATH__.sql',
      reappliable: false,
    };
    await hydrateChangeDefinitionContent({
      readRoot: '__READ_ROOT__',
      content: exampleContent,
    });
    expect(readFileAsyncMock.mock.calls.length).toEqual(1);
    expect(readFileAsyncMock.mock.calls[0][0]).toMatchObject({
      filePath: '__READ_ROOT__/__FILE_PATH__.sql',
    });
  });
  it('should return a ChangeDefinition object, with a hash on it', async () => {
    const exampleContent = {
      type: DefinitionType.CHANGE,
      id: '__ID__',
      path: '__FILE_PATH__.sql',
      reappliable: false,
    };
    const result = await hydrateChangeDefinitionContent({
      readRoot: '__READ_ROOT__',
      content: exampleContent,
    });
    expect(result.constructor).toEqual(ChangeDefinition);
    expect(result.exid).toEqual(exampleContent.id);
    expect(result.reappliable).toEqual(exampleContent.reappliable);
    expect(result.sql).toEqual('__SQL_CONTENTS__');
    expect(result.path).toEqual(`__READ_ROOT__/${exampleContent.path}`);
    expect(result.hash).toEqual(
      '3783d795180be08230d90e0178c1f2bdf09612716a51b5fb42902e486453cbd8',
    );
  });
  it('should derive the natural key from exid', async () => {
    const exampleContent = {
      type: DefinitionType.CHANGE,
      exid: '__EXID__',
      path: '__FILE_PATH__.sql',
      reappliable: false,
    };
    const result = await hydrateChangeDefinitionContent({
      readRoot: '__READ_ROOT__',
      content: exampleContent,
    });
    expect(result.exid).toEqual('__EXID__');
  });
  it('should warn with a deprecation nudge when the legacy id field is the source', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await hydrateChangeDefinitionContent({
        readRoot: '__READ_ROOT__',
        content: {
          type: DefinitionType.CHANGE,
          id: '__LEGACY_ID__',
          path: '__FILE_PATH__.sql',
          reappliable: false,
        },
      });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const [firstCall] = warnSpy.mock.calls;
      const warnMessage = firstCall ? firstCall[0] : undefined;
      expect(warnMessage).toContain('legacy `id`');
      expect(warnMessage).toMatchSnapshot();
    } finally {
      warnSpy.mockRestore();
    }
  });
  it('should not warn when the exid field is the source', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await hydrateChangeDefinitionContent({
        readRoot: '__READ_ROOT__',
        content: {
          type: DefinitionType.CHANGE,
          exid: '__EXID__',
          path: '__FILE_PATH__.sql',
          reappliable: false,
        },
      });
      expect(warnSpy).toHaveBeenCalledTimes(0);
    } finally {
      warnSpy.mockRestore();
    }
  });
  it('should throw an error if both exid and legacy id are declared', async () => {
    try {
      await hydrateChangeDefinitionContent({
        readRoot: '__READ_ROOT__',
        content: {
          type: DefinitionType.CHANGE,
          exid: '__EXID__',
          id: '__ID__',
          path: '__FILE_PATH__.sql',
        },
      });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.constructor).toEqual(InvalidDefinitionError);
      expect(error.explanation).toContain('but not both');
    }
  });
  it('should throw an error if neither exid nor legacy id are declared', async () => {
    try {
      await hydrateChangeDefinitionContent({
        readRoot: '__READ_ROOT__',
        content: {
          type: DefinitionType.CHANGE,
          path: '__FILE_PATH__.sql',
        },
      });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.constructor).toEqual(InvalidDefinitionError);
      expect(error.explanation).toContain('must declare an `exid`');
    }
  });
});
