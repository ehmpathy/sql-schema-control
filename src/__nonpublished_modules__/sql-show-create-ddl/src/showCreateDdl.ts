import { DatabaseLanguage, ResourceType } from '../../../domain';
import { showCreateDdlMysql } from './mysql/showCreateDdlMysql';
import { showCreateDdlPostgres } from './postgres/showCreateDdlPostgres';
import { DatabaseConnection } from './types';

export class ResourceDoesNotExistError extends Error {
  public resourceType: ResourceType;
  public resourceName: string;
  constructor({
    resourceType,
    resourceName,
  }: {
    resourceType: ResourceType;
    resourceName: string;
  }) {
    super(`resource ${resourceType}:${resourceName} does not exist`);
    this.resourceType = resourceType;
    this.resourceName = resourceName;
  }
}

export const showCreateDdl = async ({
  dbConnection,
  language,
  type,
  schema,
  name,
}: {
  dbConnection: DatabaseConnection;
  language: DatabaseLanguage;
  type: ResourceType;
  schema: string;
  name: string;
}): Promise<string> => {
  try {
    if (language === DatabaseLanguage.POSTGRES) {
      return await showCreateDdlPostgres({ dbConnection, type, schema, name });
    }
    if (language === DatabaseLanguage.MYSQL) {
      return await showCreateDdlMysql({ dbConnection, type, schema, name });
    }
    throw new Error(`database language '${language}' is not supported`);
  } catch (error) {
    // see if the error can be classified as a "resource does not exist" error"
    const doesNotExistErrorContents = [
      "doesn't exist",
      'does not exist',
      'could not find',
    ];
    if (
      doesNotExistErrorContents.some((relevantSubstring) =>
        error.message.includes(relevantSubstring),
      )
    ) {
      throw new ResourceDoesNotExistError({
        resourceType: type,
        resourceName: name,
      });
    }

    // if not, then just forward the error without normalizing it
    throw error;
  }
};
