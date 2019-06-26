import { ChangeDefinition, DefinitionType } from '../../../../../types';
import { hydrateChangeDefinitionContent } from './hydrateChangeDefinitionContent';
import { InvalidDefinitionError } from './errors';

/*
  validate and hydrate an array of definitinos from a yml file:
  - some will be ChangeDefinition objects
  - the rest must be strings pointing to yml files
*/
export const validateAndHydrateDefinitionsYmlContents = async ({ readRoot, contents }: { readRoot: string, contents: any[] }) => {
  if (!contents) return []; // enables empty files
  return Promise.all(contents.map(async (content): Promise<string | ChangeDefinition> => {
    if (typeof content === 'string') {
      if (content.slice(-4) !== '.yml') throw new InvalidDefinitionError({ explanation: 'string must be path to a .yml file', basis: content });
      return content;
    }
    if (typeof content === 'object') {
      if (!content.type) throw new InvalidDefinitionError({ explanation: 'definitions must have a type', basis: content });
      if (![DefinitionType.CHANGE].includes(content.type)) throw new InvalidDefinitionError({ explanation: 'unsupported definition type', basis: content });
      if (content.type === DefinitionType.CHANGE) return hydrateChangeDefinitionContent({ readRoot, content });
    }
    throw new InvalidDefinitionError({ explanation: 'invliad content type: must be object or string', basis: content });
  }));
};
