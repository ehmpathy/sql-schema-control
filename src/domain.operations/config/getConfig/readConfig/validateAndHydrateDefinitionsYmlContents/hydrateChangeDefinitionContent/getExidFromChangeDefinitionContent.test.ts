import { getError, given, then, when } from 'test-fns';

import { InvalidDefinitionError } from './../errors';
import { getExidFromChangeDefinitionContent } from './getExidFromChangeDefinitionContent';

describe('getExidFromChangeDefinitionContent', () => {
  given('[case1] content declares only `exid`', () => {
    when('[t0] the exid is derived', () => {
      then('it returns the exid with source=exid', () => {
        const result = getExidFromChangeDefinitionContent({
          content: { exid: '__EXID__' },
        });
        expect(result).toEqual({ exid: '__EXID__', source: 'exid' });
      });
    });
  });

  given('[case2] content declares only the legacy `id`', () => {
    when('[t0] the exid is derived', () => {
      then('it returns the id value with source=id (backcompat)', () => {
        const result = getExidFromChangeDefinitionContent({
          content: { id: '__LEGACY_ID__' },
        });
        expect(result).toEqual({ exid: '__LEGACY_ID__', source: 'id' });
      });
    });
  });

  given('[case3] content declares both `exid` and `id`', () => {
    when('[t0] the exid is derived', () => {
      then('it fails fast: ambiguous natural key', async () => {
        const error = await getError(() =>
          getExidFromChangeDefinitionContent({
            content: { exid: '__EXID__', id: '__LEGACY_ID__' },
          }),
        );
        expect(error).toBeInstanceOf(InvalidDefinitionError);
        expect(error.message).toContain('but not both');
      });
    });
  });

  given('[case4] content declares neither `exid` nor `id`', () => {
    when('[t0] the exid is derived', () => {
      then('it fails fast: a change must name its natural key', async () => {
        const error = await getError(() =>
          getExidFromChangeDefinitionContent({ content: {} }),
        );
        expect(error).toBeInstanceOf(InvalidDefinitionError);
        expect(error.message).toContain('must declare an `exid`');
      });
    });
  });
});
