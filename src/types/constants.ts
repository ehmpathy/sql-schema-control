export enum DefinitionType {
  RESOURCE = 'resource',
  CHANGE = 'change',
}

export enum ResourceType {
  TABLE = 'TABLE',
  FUNCTION = 'FUNCTION',
  PROCEDURE = 'PROCEDURE',
  VIEW = 'VIEW',
}

export enum DatabaseLanguage {
  MYSQL = 'mysql',
}

export interface DatabaseConnection {
  query: (args: { sql: string; values?: any[] }) => Promise<any>;
  end: () => Promise<void>;
}

export enum ChangeDefinitionStatus {
  NOT_APPLIED = 'NOT_APPLIED',
  UP_TO_DATE = 'UP_TO_DATE',
  OUT_OF_DATE = 'OUT_OF_DATE',
}
export enum ResourceDefinitionStatus {
  NOT_APPLIED = 'NOT_APPLIED',
  SYNCED = 'SYNCED',
  OUT_OF_SYNC = 'OUT_OF_SYNC',
  NOT_CONTROLLED = 'NOT_CONTROLLED',
}

export enum RequiredAction { // i.e., the the action we need to take
  NO_CHANGE = 'NO_CHANGE',
  APPLY = 'APPLY',
  REAPPLY = 'REAPPLY', // e.g., display yellow because we can fix (e.g., reapply) the discrepancy
  MANUAL_REAPPLY = 'MANUAL_REAPPLY', // e.g., display red because we cant automatically fix the discrepancy
  MANUAL_MIGRATION = 'MANUAL_MIGRATION', // e.g., display red because we cant automatically fix the discrepancy
  MANUAL_PULL = 'MANUAL_PULL', // e.g., we've found an uncontrolled resource and it should be pulled or deleted
}
