import { DefinitionType, ChangeDefinition } from '../../../../types';

/*
  validate and hydrate an array of definitinos from a yml file:
  - some will be ChangeDefinition objects
  - the rest must be strings pointing to yml files
*/

export class InvalidDefinitionError extends Error {
  public explanation: string;
  constructor({ explanation, basis }: { explanation: string, basis: any }) {
    const message = `${explanation}: ${JSON.stringify(basis)}`;
    super(message);
    this.explanation = explanation;
  }
}
export const validateAndHydrateDefinitionsYmlContents = ({ contents }: { contents: any[] }) => {
  if (!contents) return []; // enables empty files
  return contents.map((content) => {
    if (typeof content === 'string') {
      if (content.slice(-4) !== '.yml') throw new InvalidDefinitionError({ explanation: 'string must be path to a .yml file', basis: content });
      return content;
    }
    if (typeof content === 'object') {
      if (!content.type) throw new InvalidDefinitionError({ explanation: 'definitions must have a type', basis: content });
      if (![DefinitionType.CHANGE].includes(content.type)) throw new InvalidDefinitionError({ explanation: 'unsupported definition type', basis: content });
      if (content.type === DefinitionType.CHANGE) return new ChangeDefinition(content);
    }
    throw new InvalidDefinitionError({ explanation: 'invliad content type: must be object or string', basis: content });
  });
};
