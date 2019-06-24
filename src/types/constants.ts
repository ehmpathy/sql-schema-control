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

export enum ChangeDefinitionStatus {
  NOT_APPLIED = 'NOT_APPLIED',
  UP_TO_DATE = 'UP_TO_DATE',
  OUT_OF_DATE = 'OUT_OF_DATE',
}
