# howto: test cli and sdk via blackbox

## .what

test your cli and sdk as consumers would experience them — via package imports, not relative paths.

## .why

relative paths in `bin/run` like `require('../dist/contract/cli')` work during development but fail when published:
- the path lookup starts from repo root where `src/` and `dist/` both exist
- published package only has `dist/` — `src/` is not in `files`
- tests pass locally but the published package is broken

the self-link pattern catches these bugs because it forces the same lookup path as npm install.

## .the pattern

### 1. add self-link to devDependencies

```json
{
  "devDependencies": {
    "my-package": "link:."
  }
}
```

pnpm/npm creates `node_modules/my-package` pointing to your repo.

### 2. use exports field for multiple entry points

```json
{
  "main": "dist/contract/sdk.js",
  "exports": {
    ".": "./dist/contract/sdk.js",
    "./cli": "./dist/contract/cli.js"
  }
}
```

consumers can now:
- `require('my-package')` → sdk
- `require('my-package/cli')` → cli

### 3. bin/run imports via package name

```js
#!/usr/bin/env node

require('tsx/cjs'); // if needed for .ts config support

const { run } = require('my-package/cli');

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

no relative paths — uses `exports` field like any consumer would.

### 4. acceptance test runs via node_modules

```typescript
describe('cli.acceptance', () => {
  // use the self-linked package in node_modules
  const binPath = path.join(
    __dirname,
    '../../node_modules/my-package/bin/run',
  );

  given('[case1] --help flag', () => {
    when('[t0] bin/run is called with --help', () => {
      then('it shows help', () => {
        const result = execSync(`${binPath} --help`, { encoding: 'utf-8' });
        expect(result).toContain('my-package');
      });
    });
  });
});
```

## .what this catches

| bug | relative path test | self-link test |
|-----|-------------------|----------------|
| `require('../src/...')` when only `dist/` published | passes | fails |
| wrong `exports` path | passes | fails |
| missing file in `files` array | passes | fails |

## .file structure

```
package.json          # exports + self-link
bin/run               # require('my-package/cli')
src/contract/
  cli.ts              # export { run }
  sdk.ts              # export domain objects
  cli.acceptance.test.ts
```

## .see also

- ehmpathy/sql-schema-control — reference implementation
- ehmpathy/declastruct — similar pattern with tsx shebang
