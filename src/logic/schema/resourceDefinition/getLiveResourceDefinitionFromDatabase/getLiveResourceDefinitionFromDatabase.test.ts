import { showCreateDdl } from '../../../../__nonpublished_modules__/sql-show-create-ddl';
import { ResourceDefinition, ResourceType } from '../../../../domain';
import { getLiveResourceDefinitionFromDatabase } from './getLiveResourceDefinitionFromDatabase';

jest.mock('../../../../__nonpublished_modules__/sql-show-create-ddl');
const showCreateDdlMock = showCreateDdl as jest.Mock;

describe('getLiveResourceDefinitionFromDatabase', () => {
  it('should call sql-show-create-ddl to get the ddl', async () => {
    const exampleSql = '__EXAMPLE_SQL__';
    showCreateDdlMock.mockReturnValueOnce(exampleSql);
    const def = await getLiveResourceDefinitionFromDatabase({
      connection: '__DB_CONNECTION__' as any,
      resourceName: '__RESOURCE_NAME__',
      resourceType: ResourceType.TABLE,
    });
    expect(showCreateDdlMock).toHaveBeenCalledTimes(1);
    expect(def).toEqual(
      new ResourceDefinition({
        name: '__RESOURCE_NAME__',
        type: ResourceType.TABLE,
        sql: exampleSql,
      }),
    );
  });
});
