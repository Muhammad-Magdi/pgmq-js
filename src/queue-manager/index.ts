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

  public async createUnlogged(name: string) {
    const query = "SELECT pgmq.create_unlogged($1)";
    await this.pool.query(query, [name]);
  }

  public async drop(name: string) {
    const query = "SELECT pgmq.drop_queue($1)";
    await this.pool.query(query, [name]);
  }

  public async purge(name: string) {
    const query = "SELECT pgmq.purge_queue($1)";
    await this.pool.query(query, [name]);
  }

  public async detachArchive(name: string) {
    const query = "SELECT pgmq.detach_archive($1)";
    await this.pool.query(query, [name]);
  }
}
