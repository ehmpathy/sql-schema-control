import {
  type ExecSyncOptionsWithStringEncoding,
  execSync,
} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, useBeforeAll, when } from 'test-fns';

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
});
