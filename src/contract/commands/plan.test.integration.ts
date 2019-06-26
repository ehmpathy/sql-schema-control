import Plan from './plan';
import { stdout } from 'stdout-stderr';

describe('plan', () => {
  it('should have an expected appearance when all changes need to be applied', async () => {
    stdout.stripColor = false; // dont strip color
    stdout.start();
    await Plan.run(['-c', `${__dirname}/../_test_assets/control.yml`]);
    stdout.stop();
    const output = stdout.output.split('\n').filter(line => !line.includes('console.log')).join('\n');
    expect(output).toMatchSnapshot();
  });
});
