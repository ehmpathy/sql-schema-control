import { flattenDefinitionsRecursive } from './flattenDefinitionsRecursive';
import { ChangeDefinition, DefinitionType } from '../../../../types';
import { readYmlFile } from './_utils/readYmlFile';
import { validateAndHydrateDefinitionsYmlContents } from './validateAndHydrateDefinitionsYmlContents';

jest.mock('./_utils/readYmlFile');
const readYmlFileMock = readYmlFile as jest.Mock;

jest.mock('./validateAndHydrateDefinitionsYmlContents');
const validateAndHydrateDefinitionsYmlContentsMock = validateAndHydrateDefinitionsYmlContents as jest.Mock;
validateAndHydrateDefinitionsYmlContentsMock.mockResolvedValue([
  new ChangeDefinition({ id: '__DEFINITION_FROM_FILE__', path: 'some.sql', type: DefinitionType.CHANGE }),
]);

describe('flattenDefinitionsRecursive', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should return all definitions given to it, if all are DefinitionObjects', async () => { // i.e., the end case
    const definitions = [
      new ChangeDefinition({ id: 'some id', path: 'some.sql', type: DefinitionType.CHANGE }),
      new ChangeDefinition({ id: 'some other id', path: 'some2.sql', type: DefinitionType.CHANGE }),
      new ChangeDefinition({ id: 'another id', path: 'some3.sql', type: DefinitionType.CHANGE }),
    ];
    const returnedDefinitions = await flattenDefinitionsRecursive({ definitions, readRoot: '__READ_ROOT__' });
    expect(returnedDefinitions).toEqual(definitions); // we should just return them all, since theres no flattening to be done
  });
  it('should should attempt to read the contents of a each yml file, if a file path is defined as a definition', async () => {
    const definitions = [
      new ChangeDefinition({ id: 'some id', path: 'some.sql', type: DefinitionType.CHANGE }),
      'path/to/a/file.yml',
      new ChangeDefinition({ id: 'another id', path: 'some3.sql', type: DefinitionType.CHANGE }),
      'path/to/a/file2.yml',
      'path/to/a/file3.yml',
    ];
    await flattenDefinitionsRecursive({ definitions, readRoot: '__READ_ROOT__' });
    expect(readYmlFileMock.mock.calls.length).toEqual(3);
    expect(readYmlFileMock.mock.calls[0][0]).toMatchObject({ filePath: `__READ_ROOT__/${definitions[1]}` }); // check accuracy
    expect(readYmlFileMock.mock.calls[1][0]).toMatchObject({ filePath: `__READ_ROOT__/${definitions[3]}` }); // check accuracy
    expect(readYmlFileMock.mock.calls[2][0]).toMatchObject({ filePath: `__READ_ROOT__/${definitions[4]}` }); // check accuracy
  });
  it('should parse the contents of the yml file into definitions, if a file path is returned as a definition', async () => {
    readYmlFileMock.mockResolvedValueOnce([
      '__CONTENT_1__',
      '__CONTENT_2__',
      '__CONTENT_3__',
    ]);
    validateAndHydrateDefinitionsYmlContentsMock.mockResolvedValueOnce([
      new ChangeDefinition({ id: '__DEFINITION_FROM_FILE__', path: 'some.sql', type: DefinitionType.CHANGE }),
      new ChangeDefinition({ id: '__DEFINITION_FROM_FILE_2__', path: 'some2.sql', type: DefinitionType.CHANGE }),
    ]);
    const definitions = [
      new ChangeDefinition({ id: 'some id', path: 'some.sql', type: DefinitionType.CHANGE }),
      'path/to/a/file.yml',
      new ChangeDefinition({ id: 'another id', path: 'some3.sql', type: DefinitionType.CHANGE }),
    ];
    const returnedDefinitions = await flattenDefinitionsRecursive({ definitions, readRoot: '__READ_ROOT__' });
    expect(returnedDefinitions).toEqual([
      new ChangeDefinition({ id: 'some id', path: 'some.sql', type: DefinitionType.CHANGE }),
      new ChangeDefinition({ id: '__DEFINITION_FROM_FILE__', path: 'some.sql', type: DefinitionType.CHANGE }),
      new ChangeDefinition({ id: '__DEFINITION_FROM_FILE_2__', path: 'some2.sql', type: DefinitionType.CHANGE }),
      new ChangeDefinition({ id: 'another id', path: 'some3.sql', type: DefinitionType.CHANGE }),
    ]); // note the order - the order matters
  });
});
