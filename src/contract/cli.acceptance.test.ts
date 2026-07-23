import {
  type ExecSyncOptionsWithStringEncoding,
  execSync,
  spawnSync,
} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, useBeforeAll, when } from 'test-fns';

import { promiseConfig as promiseConfigMysql } from '@src/contract/.test/assets/mysql/connection.config';
import { ControlConfig, DatabaseLanguage } from '@src/domain';
import { initializeControlEnvironment } from '@src/domain.operations/config/initializeControlEnvironment';

/**
 * .what = execute bin/run command via subprocess
 * .why = encapsulate subprocess invocation for reuse and clarity
 */
const execBinRun = (input: {
  binPath: string;
  args: string[];
  cwd?: string;
}): string => {
  const options: ExecSyncOptionsWithStringEncoding = {
    encoding: 'utf-8',
    cwd: input.cwd,
  };
  return execSync(`${input.binPath} ${input.args.join(' ')}`, options);
};

/**
 * .what = coerce value to string
 * .why = execSync error output may be string or Buffer
 */
const asString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (Buffer.isBuffer(value)) return value.toString('utf-8');
  return '';
};

/**
 * .what = execute bin/run command and capture error
 * .why = encapsulate error path invocation for reuse
 *
 * .note = catch is safe here: execSync only throws on non-zero exit or spawn failure.
 *         both are expected outcomes when test CLI error paths.
 *         we verify it's an Error instance and extract status; if not an Error, we rethrow.
 */
const execBinRunWithError = (input: {
  binPath: string;
  args: string[];
  cwd?: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  const options: ExecSyncOptionsWithStringEncoding = {
    encoding: 'utf-8',
    cwd: input.cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
  };
  try {
    const stdout = execSync(
      `${input.binPath} ${input.args.join(' ')}`,
      options,
    );
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: unknown) {
    // execSync throws Error with stdout/stderr/status when command exits non-zero
    // cast to expected shape and extract; defaults handle unexpected shapes safely
    const execError = error as {
      stdout?: string | Buffer;
      stderr?: string | Buffer;
      status?: number;
    } | null;
    return {
      stdout: asString(execError?.stdout),
      stderr: asString(execError?.stderr),
      exitCode: execError?.status ?? 1,
    };
  }
};

/**
 * .what = write connection config file (js or ts)
 * .why = encapsulate config file creation for reuse
 */
const writeConnectionConfig = (input: {
  dir: string;
  ext: 'js' | 'ts';
}): void => {
  const filename = `connection.config.${input.ext}`;
  const content =
    input.ext === 'js'
      ? `
const promiseConfig = async () => ({
  host: 'localhost',
  port: 12821,
  database: 'superimportantdb',
  username: 'root',
  password: 'a-secure-password',
});
module.exports = { promiseConfig };
`
      : `
export const promiseConfig = async () => ({
  host: 'localhost',
  port: 12821,
  database: 'superimportantdb',
  username: 'root',
  password: 'a-secure-password',
});
`;
  fs.writeFileSync(path.join(input.dir, filename), content);
};

/**
 * .what = execute bin/run and capture BOTH stdout and stderr, regardless of exit code
 * .why = console.warn (e.g. the legacy-`id` deprecation nudge) writes to stderr on a
 *        SUCCESSFUL run; execSync only returns stdout, so we use spawnSync to see stderr
 */
const execBinRunCaptureStreams = (input: {
  binPath: string;
  args: string[];
  cwd?: string;
}): { stdout: string; stderr: string; exitCode: number } => {
  const result = spawnSync(`${input.binPath} ${input.args.join(' ')}`, {
    shell: true,
    encoding: 'utf-8',
    cwd: input.cwd,
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 0,
  };
};

/**
 * .what = write control.yml file
 * .why = encapsulate control file creation for reuse
 */
const writeControlYml = (input: {
  dir: string;
  connectionExt: 'js' | 'ts';
}): void => {
  const content = `
language: mysql
dialect: '5.7'
connection: ./connection.config.${input.connectionExt}
strict: false
definitions: []
`;
  fs.writeFileSync(path.join(input.dir, 'control.yml'), content);
};

/**
 * .what = write a control.yml that declares one change via the legacy `id` field
 * .why = drive the deprecation nudge through the real bin/run plan path
 */
const writeControlYmlWithLegacyChange = (input: {
  dir: string;
  connectionExt: 'js' | 'ts';
}): void => {
  // the change definition's sql file (hydration reads it to compute its hash)
  fs.writeFileSync(path.join(input.dir, 'legacy_change.sql'), 'SELECT 1;\n');
  const content = `
language: mysql
dialect: '5.7'
connection: ./connection.config.${input.connectionExt}
strict: false
definitions:
  - type: change
    path: ./legacy_change.sql
    id: legacy_change_1
    reappliable: false
`;
  fs.writeFileSync(path.join(input.dir, 'control.yml'), content);
};

/**
 * .what = write a control.yml whose change declares BOTH `id` and `exid`
 * .why = drive the ambiguous-natural-key fail-fast through the real bin/run plan path
 */
const writeControlYmlWithBothIdAndExid = (input: {
  dir: string;
  connectionExt: 'js' | 'ts';
}): void => {
  fs.writeFileSync(path.join(input.dir, 'ambiguous_change.sql'), 'SELECT 1;\n');
  const content = `
language: mysql
dialect: '5.7'
connection: ./connection.config.${input.connectionExt}
strict: false
definitions:
  - type: change
    path: ./ambiguous_change.sql
    id: ambiguous_change_1
    exid: ambiguous_change_1
    reappliable: false
`;
  fs.writeFileSync(path.join(input.dir, 'control.yml'), content);
};

/**
 * .what = write a control.yml whose change declares NEITHER `id` nor `exid`
 * .why = drive the absent-natural-key fail-fast through the real bin/run plan path
 */
const writeControlYmlWithNeitherIdNorExid = (input: {
  dir: string;
  connectionExt: 'js' | 'ts';
}): void => {
  fs.writeFileSync(path.join(input.dir, 'keyless_change.sql'), 'SELECT 1;\n');
  const content = `
language: mysql
dialect: '5.7'
connection: ./connection.config.${input.connectionExt}
strict: false
definitions:
  - type: change
    path: ./keyless_change.sql
    reappliable: false
`;
  fs.writeFileSync(path.join(input.dir, 'control.yml'), content);
};

/**
 * .what = redact variable paths from output
 * .why = paths change per machine/run; redact for snapshot stability
 */
const redactPaths = (output: string): string => {
  return output
    .replace(/\.temp\/[^\s]+/g, '<TEMP>')
    .replace(/\/home\/[^\s]+sql-schema-control[^\s]*/g, '<REPO>')
    .replace(/Node\.js v[\d.]+/g, 'Node.js <VERSION>');
};

/**
 * .what = extract the deterministic error message (message + metadata) from stderr
 * .why = a BadRequestError prints its message and json metadata, then an absolute-path
 *        stack trace whose line numbers and paths shift per machine/run. snapshot only the
 *        stable message + metadata (the part a user reads); drop the stack. this lets the
 *        error journeys be snapped deterministically, with no absolute-path visual blemish.
 */
const asErrorMessageSnapshot = (stderr: string): string => {
  // the stack trace begins at the first "    at " frame; keep the message before it
  const beforeStack = stderr.split('\n    at ')[0] ?? stderr;
  return redactPaths(beforeStack).trimEnd();
};

/**
 * .what = acceptance tests for bin/run entrypoint
 * .why = verify the published package works end-to-end via subprocess
 *
 * .note = tests run via node_modules/sql-schema-control/bin/run
 *         which uses require('sql-schema-control/cli') to load cli
 *         this proves the package works when installed via npm
 */
describe('cli.acceptance', () => {
  // use the self-linked package in node_modules (via "sql-schema-control": "link:." in devDependencies)
  const binPath = path.resolve(
    __dirname,
    '../../node_modules/sql-schema-control/bin/run',
  );

  given('[case1] --help flag', () => {
    when('[t0] bin/run is called with --help', () => {
      then('it should show help and exit 0', () => {
        const result = execBinRun({ binPath, args: ['--help'] });

        // verify key commands are present
        expect(result).toContain('sql-schema-control');
        expect(result).toContain('plan');
        expect(result).toContain('apply');

        // snapshot the full help output for visual diff in PRs
        expect(result).toMatchSnapshot();
      });
    });
  });

  given('[case2] plan with .js config', () => {
    const scene = useBeforeAll(async () => {
      const configDir = genTempDir({ slug: 'config-js' });
      writeConnectionConfig({ dir: configDir, ext: 'js' });
      writeControlYml({ dir: configDir, connectionExt: 'js' });
      return { configDir };
    });

    when('[t0] bin/run plan is called with .js config', () => {
      then('it should run plan and exit 0', () => {
        const controlPath = path.join(scene.configDir, 'control.yml');
        const result = execBinRun({
          binPath,
          args: ['plan', '-c', controlPath],
        });

        // verify plan command runs
        expect(result).toContain('Planning');

        // snapshot with redacted paths for stability
        expect(redactPaths(result)).toMatchSnapshot();
      });
    });
  });

  given('[case3] plan with .ts config', () => {
    const scene = useBeforeAll(async () => {
      const configDir = genTempDir({ slug: 'config-ts' });
      writeConnectionConfig({ dir: configDir, ext: 'ts' });
      writeControlYml({ dir: configDir, connectionExt: 'ts' });
      return { configDir };
    });

    when('[t0] bin/run plan is called with .ts config', () => {
      then('it should run plan and exit 0 (tsx registration works)', () => {
        const controlPath = path.join(scene.configDir, 'control.yml');
        const result = execBinRun({
          binPath,
          args: ['plan', '-c', controlPath],
        });

        // verify plan command runs (proves tsx registration works for .ts config)
        expect(result).toContain('Planning');

        // snapshot with redacted paths for stability
        expect(redactPaths(result)).toMatchSnapshot();
      });
    });
  });

  given('[case4] invalid config path', () => {
    when('[t0] bin/run plan is called with non-existent config', () => {
      then('it should exit with error and show helpful message', () => {
        const result = execBinRunWithError({
          binPath,
          args: ['plan', '-c', '/nonexistent/control.yml'],
        });

        // verify error exit
        expect(result.exitCode).not.toEqual(0);

        // snapshot error output for visual diff
        expect(redactPaths(result.stderr)).toMatchSnapshot();
      });
    });
  });

  given('[case5] no command provided', () => {
    when('[t0] bin/run is called with no arguments', () => {
      then('it should show help', () => {
        const result = execBinRunWithError({ binPath, args: [] });

        // verify it shows usage (commander outputs to stderr when no command)
        const output = result.stdout || result.stderr;
        expect(output).toContain('sql-schema-control');
        expect(output).toContain('Commands:');

        // snapshot output
        expect(output).toMatchSnapshot();
      });
    });
  });

  given('[case6] sync with the removed --id flag', () => {
    when('[t0] bin/run sync is called with --id', () => {
      then('it should exit non-zero with a clear rename hint', () => {
        // .why = the --id -> --exid rename is this wish's literal cli deliverable;
        //        prove the guidance surfaces through the packaged bin/run entrypoint
        const result = execBinRunWithError({
          binPath,
          args: ['sync', '--id', 'init_service_user'],
        });

        // verify error exit and the rename guidance
        expect(result.exitCode).not.toEqual(0);
        expect(result.stderr).toContain(
          "the '--id' flag was renamed to '--exid'",
        );
        // snapshot the deterministic message + metadata (stack stripped) so the negative
        // sync journey is visible in the acceptance .snap without a variable-path blemish
        expect(asErrorMessageSnapshot(result.stderr)).toMatchSnapshot();
      });
    });
  });

  given('[case7] sync with no exid', () => {
    when('[t0] bin/run sync is called with no --exid', () => {
      then('it should exit non-zero and require the exid', () => {
        const result = execBinRunWithError({
          binPath,
          args: ['sync'],
        });

        // verify error exit and the required-option guidance
        expect(result.exitCode).not.toEqual(0);
        expect(result.stderr).toContain("the '--exid' option is required");
        // snapshot the deterministic message + metadata (stack stripped) so the negative
        // sync journey is visible in the acceptance .snap without a variable-path blemish
        expect(asErrorMessageSnapshot(result.stderr)).toMatchSnapshot();
      });
    });
  });

  given('[case8] plan with a legacy id change definition', () => {
    const scene = useBeforeAll(async () => {
      const configDir = genTempDir({ slug: 'config-legacy-id' });
      writeConnectionConfig({ dir: configDir, ext: 'js' });
      writeControlYmlWithLegacyChange({ dir: configDir, connectionExt: 'js' });
      return { configDir };
    });

    when('[t0] bin/run plan is called on a control.yml that uses id:', () => {
      then('it should print the deprecation nudge to stderr', () => {
        // .why = the console.warn nudge is the backcompat window's whole UX — the way a
        //        config author discovers to move id: -> exid:; prove it reaches a real
        //        operator's terminal through the packaged bin/run, not just a unit spy
        const controlPath = path.join(scene.configDir, 'control.yml');
        const result = execBinRunCaptureStreams({
          binPath,
          args: ['plan', '-c', controlPath],
        });

        // the nudge lands on stderr; plan itself still succeeds (backcompat, not a hard error)
        expect(result.stderr).toContain('legacy `id` field');
        expect(result.stderr).toContain("found id='legacy_change_1'");
        expect(result.stdout).toContain('Planning');

        // snapshot the deterministic deprecation nudge (embeds content.id, no volatile path) so
        // the legacy-id plan variant's user-seen stderr is visible in the acceptance .snap.
        // stdout carries a dynamic temp-path plan output — asserted by phrase above, not
        // snapped — but the nudge line itself is machine-stable.
        expect(redactPaths(result.stderr).trimEnd()).toMatchSnapshot();
      });
    });
  });

  given('[case9] plan with a change that declares BOTH id and exid', () => {
    const scene = useBeforeAll(async () => {
      const configDir = genTempDir({ slug: 'config-both-id-exid' });
      writeConnectionConfig({ dir: configDir, ext: 'js' });
      writeControlYmlWithBothIdAndExid({ dir: configDir, connectionExt: 'js' });
      return { configDir };
    });

    when(
      '[t0] bin/run plan is called on a control.yml with both id and exid',
      () => {
        then(
          'it should exit non-zero with an ambiguous-natural-key error',
          () => {
            // .why = the vision's "edgecases & pit of success" table names BOTH id+exid as a
            //        fail-fast case; prove the guard surfaces through the packaged bin/run, not
            //        just a unit spy. hydration derives the exid before any db call, so this
            //        fails fast without a reachable database.
            const controlPath = path.join(scene.configDir, 'control.yml');
            const result = execBinRunWithError({
              binPath,
              args: ['plan', '-c', controlPath],
            });

            expect(result.exitCode).not.toEqual(0);
            expect(result.stderr).toContain('but not both');
            // snapshot the deterministic message (bin/run prints error.message only, no stack;
            // InvalidDefinitionError embeds the raw relative-path yml, so it's machine-stable —
            // same treatment as case6/7/13). this snaps the ambiguous-natural-key plan variant.
            expect(asErrorMessageSnapshot(result.stderr)).toMatchSnapshot();
          },
        );
      },
    );
  });

  given('[case10] plan with a change that declares NEITHER id nor exid', () => {
    const scene = useBeforeAll(async () => {
      const configDir = genTempDir({ slug: 'config-neither-id-exid' });
      writeConnectionConfig({ dir: configDir, ext: 'js' });
      writeControlYmlWithNeitherIdNorExid({
        dir: configDir,
        connectionExt: 'js',
      });
      return { configDir };
    });

    when(
      '[t0] bin/run plan is called on a control.yml with neither id nor exid',
      () => {
        then('it should exit non-zero and require the exid', () => {
          // .why = the vision's edgecase table names the absent natural key as a fail-fast
          //        case; prove it surfaces through the packaged bin/run, mirroring case9
          const controlPath = path.join(scene.configDir, 'control.yml');
          const result = execBinRunWithError({
            binPath,
            args: ['plan', '-c', controlPath],
          });

          expect(result.exitCode).not.toEqual(0);
          expect(result.stderr).toContain('must declare a');
          // snapshot the deterministic message (bin/run prints error.message only, no stack;
          // InvalidDefinitionError embeds the raw relative-path yml, so it's machine-stable —
          // same treatment as case6/7/13). this snaps the absent-natural-key plan variant.
          expect(asErrorMessageSnapshot(result.stderr)).toMatchSnapshot();
        });
      },
    );
  });

  given('[case11] sync --help flag', () => {
    when('[t0] bin/run sync is called with --help', () => {
      then('it should show sync help (incl. --exid) and exit 0', () => {
        // .why = `sync` is this wish's CLI deliverable; its --help output is a distinct
        //        user-visible surface that could drift silently. snapshot it so PRs can
        //        vibecheck the --exid guidance (and its `(required)` hint) end-to-end.
        const result = execBinRun({ binPath, args: ['sync', '--help'] });

        // verify the renamed flag and its required-ness surface in help
        expect(result).toContain('--exid');
        expect(result).toContain('(required)');

        // snapshot the full help output (static text, no volatile paths) for visual diff
        expect(result).toMatchSnapshot();
      });
    });
  });

  given(
    '[case12] sync --exid on a real change definition (positive path)',
    () => {
      // the repo root — run bin/run from here so the [SYNC] path renders relative + stable
      const repoRoot = path.resolve(__dirname, '../..');
      const controlYmlRel = 'src/contract/.test/assets/mysql/control.yml'; // points at the local mysql testdb

      // provision the changelog table so `sync` has a place to record the change.
      // setup via internals is allowed for acceptance; the ACTION still runs through bin/run.
      const scene = useBeforeAll(async () => {
        const config = new ControlConfig({
          language: DatabaseLanguage.MYSQL,
          dialect: '5.7',
          connection: await promiseConfigMysql(),
          definitions: [],
          strict: false,
        });
        const { connection } = await initializeControlEnvironment({ config });
        return { connection };
      });
      afterAll(async () => {
        await scene.connection.end();
      });

      when('[t0] bin/run sync is called with a valid --exid', () => {
        then('it should record the change and print the sync line', () => {
          // .why = the positive sync journey is this wish's headline operator flow; prove it
          //        reconciles the changelog end-to-end through the packaged bin/run, and snap
          //        the deterministic success line for PR vibechecks.
          const result = execBinRun({
            binPath,
            args: ['sync', '-c', controlYmlRel, '--exid', 'init_service_user'],
            cwd: repoRoot,
          });

          // the success line names the path + the change:<exid> reference id
          expect(result).toContain('[SYNC]');
          expect(result).toContain('(change:init_service_user)');

          // snapshot the sanitized success output (timestamps stripped) for drift detection
          const sanitized = redactPaths(
            result.replace(/\[\d\d:\d\d:\d\d\]/g, ''),
          ).trimEnd();
          expect(sanitized).toMatchSnapshot();
        });
      });
    },
  );

  given(
    '[case13] sync --exid that matches no change definition (not-found path)',
    () => {
      // run bin/run from the repo root so the control.yml relative path lands + the
      // mysql testdb connection derives from the same asset case12 uses
      const repoRoot = path.resolve(__dirname, '../..');
      const controlYmlRel = 'src/contract/.test/assets/mysql/control.yml';

      // provision the changelog environment so `getControlContextFromConfig` connects cleanly;
      // the not-found guard fires on the absent exid before any changelog query, but the
      // control context still opens a db connection first — mirror case12's setup for parity.
      const scene = useBeforeAll(async () => {
        const config = new ControlConfig({
          language: DatabaseLanguage.MYSQL,
          dialect: '5.7',
          connection: await promiseConfigMysql(),
          definitions: [],
          strict: false,
        });
        const { connection } = await initializeControlEnvironment({ config });
        return { connection };
      });
      afterAll(async () => {
        await scene.connection.end();
      });

      when(
        '[t0] bin/run sync is called with an exid no definition declares',
        () => {
          then('it should exit non-zero with a clear not-found error', () => {
            // .why = an operator who fat-fingers an exid (or names a change that no longer
            //        exists) must see a precise "could not find" error, not a silent no-op.
            //        this is the user-facing negative variant of the positive case12 journey;
            //        snap it so the not-found guidance is visible in the acceptance .snap.
            const result = execBinRunWithError({
              binPath,
              args: [
                'sync',
                '-c',
                controlYmlRel,
                '--exid',
                '__no_such_change__',
              ],
              cwd: repoRoot,
            });

            // verify error exit and the not-found guidance names the referenceId
            expect(result.exitCode).not.toEqual(0);
            expect(result.stderr).toContain(
              "could not find a definition with referenceId 'change:__no_such_change__'",
            );
            // snapshot the deterministic message + metadata (stack stripped) so the not-found
            // sync journey is visible in the acceptance .snap without a variable-path blemish
            expect(asErrorMessageSnapshot(result.stderr)).toMatchSnapshot();
          });
        },
      );
    },
  );
});
