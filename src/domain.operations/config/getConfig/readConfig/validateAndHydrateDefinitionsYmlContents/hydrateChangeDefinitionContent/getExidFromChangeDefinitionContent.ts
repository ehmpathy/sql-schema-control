import { InvalidDefinitionError } from './../errors';

/**
 * .what = derive a change definition's natural key (exid) from its raw yml content
 * .why = the "prefer exid, accept legacy id, reject both, reject neither" rule is pure
 *        decision logic. pulled out of the file-i/o + hash orchestrator it becomes directly
 *        unit-testable (no mocked file read) and reusable by any future exid-resolution need
 *        (e.g. an offline yml validator). the `source` tells the caller which field won, so
 *        the deprecation nudge (a side effect) stays in the orchestrator, not in here.
 */
export const getExidFromChangeDefinitionContent = ({
  content,
}: {
  content: { exid?: string; id?: string };
}): { exid: string; source: 'exid' | 'id' } => {
  // reject ambiguity: a change may declare `exid` or the legacy `id`, but never both
  if (content.exid !== undefined && content.id !== undefined)
    throw new InvalidDefinitionError({
      explanation:
        'a change may declare `exid` or the legacy `id`, but not both. prefer `exid`.',
      basis: content,
    });

  // prefer the canonical `exid`
  if (content.exid !== undefined) return { exid: content.exid, source: 'exid' };

  // fall back to the legacy `id` for backcompat
  if (content.id !== undefined) return { exid: content.id, source: 'id' };

  // reject absence: a change must name its natural key
  throw new InvalidDefinitionError({
    explanation: 'a change must declare an `exid` (its natural key)',
    basis: content,
  });
};
