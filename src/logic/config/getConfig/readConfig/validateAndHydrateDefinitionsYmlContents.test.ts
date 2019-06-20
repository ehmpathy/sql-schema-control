import { validateAndHydrateDefinitionsYmlContents, InvalidDefinitionError } from './validateAndHydrateDefinitionsYmlContents';
import { ChangeDefinition } from '../../../../types';

describe('validateAndHydrateDefinitionsYmlContents', () => {
  it('should throw an error if typedef is not a string or object', () => {
    try {
      validateAndHydrateDefinitionsYmlContents({ contents: [5] });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.constructor).toEqual(InvalidDefinitionError);
      expect(error.explanation).toEqual('invliad content type: must be object or string');
    }
  });
  it('should throw an error if the content is a string but not a yml path', () => {
    try {
      validateAndHydrateDefinitionsYmlContents({ contents: ['path/to/some.json'] });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.constructor).toEqual(InvalidDefinitionError);
      expect(error.explanation).toEqual('string must be path to a .yml file');
    }
  });
  it('should return the string if the string looks like a path to a yml', () => {
    const ymlPath = 'path/to/some.yml';
    const definitions = validateAndHydrateDefinitionsYmlContents({ contents: [ymlPath] });
    expect(definitions[0]).toEqual(ymlPath);
  });
  it('should throw an error if the object is not of a supported type', () => {
    try {
      validateAndHydrateDefinitionsYmlContents({ contents: [{ type: 'balogna' }] });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.constructor).toEqual(InvalidDefinitionError);
      expect(error.explanation).toEqual('unsupported definition type');
    }
  });
  it('should return a ChangeDefinition object if type was ChangeDefinition', () => { // note: change definition is a run-time type checked object, so it will throw its own errors if type validation fails
    const definitions = validateAndHydrateDefinitionsYmlContents({ contents: [{ type: 'change', id: 'some id', path: 'some.sql' }] });
    expect(definitions[0].constructor).toEqual(ChangeDefinition);
  });
});
