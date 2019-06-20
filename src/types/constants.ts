export enum DefinitionType {
  RESOURCE = 'resource',
  CHANGE = 'change',
}

export enum DatabaseLanguage {
  MYSQL = 'mysql',
}

export interface DatabaseConnection {
  query: (args: { sql: string, values?: any[] }) => Promise<any>;
  end: () => Promise<void>;
}
