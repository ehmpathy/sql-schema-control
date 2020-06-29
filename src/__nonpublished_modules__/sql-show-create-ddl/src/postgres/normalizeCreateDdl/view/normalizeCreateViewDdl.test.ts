import { normalizeCreateViewDdl } from './normalizeCreateViewDdl';

const simpleViewExample = `
CREATE
OR REPLACE VIEW test_view_for_normalization_on AS
SELECT
  'hello' :: text AS first_words;
`.trim();

describe('normalizeCreateViewDdl', () => {
  it('should remove :: types from the ddl, since theyre not helpful for comparisons', () => {
    const normalizedDdl = normalizeCreateViewDdl({ ddl: simpleViewExample });
    expect(normalizedDdl).not.toContain(' :: text');
    expect(normalizedDdl).toContain("'hello' AS first_words");
  });
  it('should put CREATE and OR REPLACE on the same line, if not already', () => {
    const normalizedDdl = normalizeCreateViewDdl({ ddl: simpleViewExample });
    expect(normalizedDdl).not.toContain('CREATE\nOR REPLACE');
    expect(normalizedDdl).toContain('CREATE OR REPLACE');
  });
});
