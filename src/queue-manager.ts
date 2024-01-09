import { Client } from "pg";
import Pool from "pg-pool";
import { parseDbQueue } from "./helpers";
import { Queue } from "./types";

export class QueueManager {
  constructor(private readonly pool: Pool<Client>) {}

  public async list(): Promise<Queue[]> {
    const query = "SELECT pgmq.list_queues()";
    const { rows } = await this.pool.query<{ list_queues: string }>(query);
    return rows.map(({ list_queues }) => parseDbQueue(list_queues));
  }

  public async create(name: string) {
    const query = "SELECT pgmq.create($1)";
    await this.pool.query(query, [name]);
  }
  public async drop(name: string) {
    await this.pool.query("SELECT pgmq.drop_queue($1)", [name]);
  }
}
