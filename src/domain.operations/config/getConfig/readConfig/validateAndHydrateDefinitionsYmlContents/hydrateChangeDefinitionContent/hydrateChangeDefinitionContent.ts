import sha256 from 'simple-sha256';

import { ChangeDefinition } from '@src/domain';

import { readFileAsync } from './../../../../_utils/readFileAsync';
import { InvalidDefinitionError } from './../errors';
import { getExidFromChangeDefinitionContent } from './getExidFromChangeDefinitionContent';

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

  // 3. derive the natural key: prefer `exid`, accept legacy `id` for backcompat
  const { exid, source } = getExidFromChangeDefinitionContent({ content });

  // warn when the legacy `id` field is the source, to nudge authors toward `exid`
  if (source === 'id')
    console.warn(
      // tslint:disable-line no-console
      `⚠️  change definition uses the legacy \`id\` field; prefer \`exid\` (natural key). found id='${content.id}'`,
    );

  // 4. define the change definition
  return new ChangeDefinition({
    sql,
    hash,
    path: filePath, // the absolute file path to the sql file
    exid,
    reappliable: content.reappliable,
  });
};
