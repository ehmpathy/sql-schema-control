import sha256 from 'simple-sha256';

import { ChangeDefinition } from '../../../../../../domain';
import { readFileAsync } from './../../../../_utils/readFileAsync';
import { InvalidDefinitionError } from './../errors';

export const hydrateChangeDefinitionContent = async ({
  readRoot,
  content,
}: {
  readRoot: string;
  content: any;
}) => {
  // 1. get the sql defined at the path
  if (!content.path)
    throw new InvalidDefinitionError({
      explanation: 'path must be defined',
      basis: content,
    });
  if (content.path.split('.').slice(-1)[0] !== 'sql') {
    throw new InvalidDefinitionError({
      explanation: 'path must specify a .sql file',
      basis: content,
    });
  }
  const filePath = `${readRoot}/${content.path}`;
  const sql = await readFileAsync({ filePath });

  // 2. calculate the hash of the sql
  const hash = await sha256(sql);

  // 3. define the change definition
  return new ChangeDefinition({
    sql,
    hash,
    path: filePath, // the absolute file path to the sql file
    id: content.id,
    reappliable: content.reappliable,
  });
};
