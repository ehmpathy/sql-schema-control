import { ChangeDefinition, type ResourceDefinition } from '../../domain';

export const getReferenceIdForDefinition = ({
  definition,
}: {
  definition: ChangeDefinition | ResourceDefinition;
}) => {
  const definitionType =
    definition instanceof ChangeDefinition ? 'change' : 'resource';
  const definitionId =
    definition instanceof ChangeDefinition
      ? definition.id
      : `${definition.type.toLowerCase()}:${definition.name}`;
  const referenceId = `${definitionType}:${definitionId}`;
  return referenceId;
};
