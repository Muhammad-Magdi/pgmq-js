import { Client } from 'pg';
import Pool from 'pg-pool';
import { PgPoolConfig } from './types';
import {
  DEFAULT_CONNECTION_TIMEOUT_MILLIS,
  DEFAULT_IDLE_TIMEOUT_MILLIS,
  DEFAULT_MAX_POOL_SIZE,
  DEFAULT_MAX_USES,
  DEFAULT_SSL,
  defaultPgmqConfig,
} from './constants';
import { QueueManager } from './queue-manager';
import { MsgManager } from './msg-manager';

export class Pgmq {
  public readonly queue: QueueManager;
  public readonly msg: MsgManager;

  private constructor(private readonly pool: Pool<Client>) {
    this.queue = new QueueManager(pool);
    this.msg = new MsgManager(pool);
  }

  public static async new(c: PgPoolConfig, pgmqConfig = defaultPgmqConfig) {
    if (c.max === undefined) c.max = DEFAULT_MAX_POOL_SIZE;
    if (c.idleTimeoutMillis === undefined) c.max = DEFAULT_IDLE_TIMEOUT_MILLIS;
    if (c.connectionTimeoutMillis === undefined)
      c.connectionTimeoutMillis = DEFAULT_CONNECTION_TIMEOUT_MILLIS;
    if (c.maxUses === undefined) c.maxUses = DEFAULT_MAX_USES;
    if (c.ssl === undefined) c.ssl = DEFAULT_SSL;

    const pool = new Pool(c);

    const pgmq = new Pgmq(pool);
    if (!pgmqConfig.skipExtensionCreation) await pgmq.prepare();

    return pgmq;
  }

  private async prepare() {
    const client = await this.pool.connect();
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS pgmq CASCADE;');
    } finally {
      client.release();
    }
  }

  public async close() {
    await this.pool.end();
  }
}
