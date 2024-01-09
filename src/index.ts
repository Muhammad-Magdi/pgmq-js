import { Client } from "pg";
import Pool from "pg-pool";
import { PgPoolConfig } from "./types";
import {
  DEFAULT_CONNECTION_TIMEOUT_MILLIS,
  DEFAULT_IDLE_TIMEOUT_MILLIS,
  DEFAULT_MAX_POOL_SIZE,
  DEFAULT_MAX_USES,
  DEFAULT_SSL,
} from "./constants";
import { QueueManager } from "./queue-manager";

export class Pgmq {
  public readonly queue: QueueManager;

  private constructor(private readonly pool: Pool<Client>) {
    this.queue = new QueueManager(pool);
  }

  public static async new(c: PgPoolConfig) {
    if (c.max === undefined) c.max = DEFAULT_MAX_POOL_SIZE;
    if (c.idleTimeoutMillis === undefined) c.max = DEFAULT_IDLE_TIMEOUT_MILLIS;
    if (c.connectionTimeoutMillis === undefined)
      c.connectionTimeoutMillis = DEFAULT_CONNECTION_TIMEOUT_MILLIS;
    if (c.maxUses === undefined) c.maxUses = DEFAULT_MAX_USES;
    if (c.ssl === undefined) c.ssl = DEFAULT_SSL;

    const pool = new Pool(c);

    await pool.connect();
    const pgmq = new Pgmq(pool);
    await pgmq.prepare();
    return pgmq;
  }

  private async prepare() {
    await this.pool.query("CREATE EXTENSION IF NOT EXISTS pgmq CASCADE");
  }
}
