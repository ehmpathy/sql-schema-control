# rule.require.both-dialects-tested

## .what

any behavior that acts on the database must be proven by integration tests against **both**
supported dialects — **mysql** and **postgres** — not just one.

## .why

this repo emits dialect-specific sql. the two dialects diverge in ways that silently pass one
engine and break the other:

- ddl syntax: mysql `ALTER TABLE ... CHANGE col ...` vs postgres `ALTER TABLE ... RENAME COLUMN ...`
- upsert: mysql `ON DUPLICATE KEY UPDATE` vs postgres `ON CONFLICT (...) DO UPDATE`
- identifiers, quotes, `information_schema` scope, `search_path`, type names, auto-increment

a test that covers only one dialect gives false confidence: the code can be green locally and
still ship a broken migration or query to the other engine in prod. every consumer picks one
engine, so a one-dialect gap is a guaranteed prod defect for half the fleet.

## .the rule

for each db-bound behavior, the integration test file must have a `mysql` describe block AND a
`postgres` describe block, each that proves the same behavior. if a case only makes sense for one
dialect (e.g. postgres multi-schema `search_path`), keep it — but the shared behavior still needs
both.

## .the pattern

```ts
describe('provisionChangeLogTable', () => {
  describe('mysql', () => {
    // ...connect to the mysql testdb...
    it('should migrate a legacy change_id table to change_exid in one provision call', async () => {
      // seed the legacy schema, run the real orchestrator, assert the outcome
    });
  });
  describe('postgres', () => {
    // ...connect to the postgres testdb...
    it('should migrate a legacy change_id table to change_exid in one provision call', async () => {
      // same behavior, postgres dialect
    });
  });
});
```

## .prove the real path, not a proxy

when the behavior is a schema migration, test the **orchestrator** (e.g.
`provisionChangeLogTable`) against the **real table name** seeded with the **prior** shape, called
**once** — that is the actual prod upgrade. a temp-table test that runs the raw sql via
string-replace proves the sql, but not that the orchestrator drives it. prefer both: the raw-sql
temp-table test to isolate the sql, plus the atomic one-call test on the real table to prove the
full path end-to-end.

## .where

- `src/**/*.integration.test.ts`
- reference: `src/domain.operations/config/initializeControlEnvironment/provisionChangeLogTable.integration.test.ts`

## .enforcement

db-bound behavior tested against only one dialect = blocker
