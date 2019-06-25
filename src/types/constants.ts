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

export enum RequiredAction { // i.e., the the action we need to take
  NO_CHANGE = 'NO_CHANGE',
  APPLY = 'APPLY',
  REAPPLY = 'REAPPLY', // e.g., display yellow because we can fix (e.g., reapply) the discrepency
  MANUAL_REAPPLY = 'MANUAL_REAPPLY', // e.g., display red because we cant automatically fix the discrepency
}
