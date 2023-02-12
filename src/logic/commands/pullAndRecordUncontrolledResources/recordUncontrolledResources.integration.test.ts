import { ResourceDefinition, ResourceType } from '../../../types';
import { recordUncontrolledResources } from './recordUncontrolledResources';
import { readFile } from './utils/fileIO';

describe('recordUncontrolledResources', () => {
  const targetDir = `${__dirname}/__test_assets__/uncontrolled`;
  it('should accurately record an uncontrolled table resource', async () => {
    const resource = new ResourceDefinition({
      sql: '__TABLE_SQL__',
      type: ResourceType.TABLE,
      name: 'super_awesome_table',
    });
    await recordUncontrolledResources({
      targetDir,
      uncontrolledResources: [resource],
    });
    const contents = await readFile(
      `${targetDir}/tables/${resource.name}.sql`,
      'utf8',
    );
    expect(contents).toEqual(resource.sql);
  });
  it('should accurately record an uncontrolled procedure resource', async () => {
    const resource = new ResourceDefinition({
      sql: '__TABLE_SQL__',
      type: ResourceType.PROCEDURE,
      name: 'super_awesome_procedure',
    });
    await recordUncontrolledResources({
      targetDir,
      uncontrolledResources: [resource],
    });
    const contents = await readFile(
      `${targetDir}/procedures/${resource.name}.sql`,
      'utf8',
    );
    expect(contents).toEqual(resource.sql);
  });
  it('should accurately record an uncontrolled function resource', async () => {
    const resource = new ResourceDefinition({
      sql: '__TABLE_SQL__',
      type: ResourceType.FUNCTION,
      name: 'super_awesome_function',
    });
    await recordUncontrolledResources({
      targetDir,
      uncontrolledResources: [resource],
    });
    const contents = await readFile(
      `${targetDir}/functions/${resource.name}.sql`,
      'utf8',
    );
    expect(contents).toEqual(resource.sql);
  });
});
