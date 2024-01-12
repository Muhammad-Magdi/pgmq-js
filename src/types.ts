export interface PgPoolConfig {
  host: string;
  database: string;
  user: string;
  password: string;
  port: number;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  maxUses?: number;
}
