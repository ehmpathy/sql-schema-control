import { readYmlFile } from './_utils/readYmlFile';
import { validateAndHydrateDefinitionsYmlContents } from './validateAndHydrateDefinitionsYmlContents';
import { ChangeDefinition } from '../../../../types';

/*
  recursivly parse, validate, and read schema control definitions:
  - if the definition is a string, then assume that string is path to yml file of defitions
    - read the file
    - read the definitions recursively
    - extend the results initial definitions array with the additional results
*/
type DefinitionInput = ChangeDefinition | string;
export const flattenDefinitionsRecursive = async ({ definitions, readRoot }: { definitions: DefinitionInput[], readRoot: string }): Promise<ChangeDefinition[]> => {
  const arraysOfDefinitions = await Promise.all(definitions.map(async (definition): Promise<ChangeDefinition[]> => {
    // if the element is a ChangeDefinition object, return it in an array
    if (definition.constructor === ChangeDefinition) return [definition as ChangeDefinition]; // array since, although its the only definition we're getting from the list entry, it still needs to be "flatten"-able

    // since we now know it is not a ChangeDefinition, it must be a string.
    const ymlContents = await readYmlFile({ filePath: `${readRoot}/${definition}` });
    const subDefinitions = await validateAndHydrateDefinitionsYmlContents({ contents: ymlContents });
    const subFlattenedDefinitions = await flattenDefinitionsRecursive({ readRoot, definitions: subDefinitions });
    return subFlattenedDefinitions;
  }));
  const flattenedDefinitions = ([] as ChangeDefinition[]).concat(...arraysOfDefinitions);
  return flattenedDefinitions;
};
