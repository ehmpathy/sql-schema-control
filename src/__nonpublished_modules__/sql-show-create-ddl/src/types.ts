export interface DatabaseConnection {
  query: (args: { sql: string; values?: (string | number)[] }) => Promise<{ rows: any[] }>;
  end: () => Promise<void>;
}
