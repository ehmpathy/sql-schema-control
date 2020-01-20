import chalk from 'chalk';
import { ResourceDefinition, ResourceType } from '../../../types';
import { mkdir, writeFile } from './utils/fileIO';

/*
  for each ResourceDefinition, write the sql to a file of appropriate name in standard directory in targetDir
*/
const standardResourceDirectoryNamePerResourceType = {
  [ResourceType.TABLE]: 'tables',
  [ResourceType.PROCEDURE]: 'procedures',
  [ResourceType.FUNCTION]: 'functions',
};
export const recordUncontrolledResources = async ({
  targetDir,
  uncontrolledResources,
}: {
  targetDir: string;
  uncontrolledResources: ResourceDefinition[];
}) => {
  console.log(`pulling uncontrolled resource definitions into ${targetDir}`); // tslint:disable-line no-console
  await Promise.all(
    uncontrolledResources.map(async (resource) => {
      // 1. find or create the resource directory for this resource
      const dir = `${targetDir}/${standardResourceDirectoryNamePerResourceType[resource.type]}`;
      await mkdir(dir).catch((error) => {
        if (error.code !== 'EEXIST') throw error;
      }); // mkdir and ignore if dir already exists

      // 2. write the resource sql to that dir
      const filePath = `${dir}/${resource.name}.sql`;
      await writeFile(filePath, resource.sql);

      // 3. log that it was successfully pulled
      const pullBadge = chalk.green('✓ [PULLED]');
      const identifier = chalk.white(`resource:${resource.type.toLowerCase()}:${resource.name}`);
      console.log(chalk.bold(`  ${pullBadge} ${identifier}`)); // tslint:disable-line no-console
    }),
  );
};
