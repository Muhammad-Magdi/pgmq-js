import { parseDbQueue, parseDbQueueMetrics } from './helpers';
import { DbQueueMetrics, Queue } from './types';
import { QueryExecuter } from '../query-executer';

export class QueueManager extends QueryExecuter {
  public async list(): Promise<Queue[]> {
    const query = 'SELECT pgmq.list_queues()';
    const { rows } = await this.executeQuery<{ list_queues: string }>(query);
    return rows.map(({ list_queues }) => parseDbQueue(list_queues));
  }

  public async create(name: string) {
    const query = 'SELECT pgmq.create($1)';
    await this.executeQuery(query, [name]);
  }

  public async createUnlogged(name: string) {
    const query = 'SELECT pgmq.create_unlogged($1)';
    await this.executeQuery(query, [name]);
  }

  public async drop(name: string) {
    const query = 'SELECT pgmq.drop_queue($1)';
    await this.executeQuery(query, [name]);
  }

  public async purge(name: string) {
    const query = 'SELECT pgmq.purge_queue($1)';
    await this.executeQuery(query, [name]);
  }

  public async detachArchive(name: string) {
    const query = 'SELECT pgmq.detach_archive($1)';
    await this.executeQuery(query, [name]);
  }

  public async getMetrics(name: string) {
    const query = 'SELECT * FROM pgmq.metrics($1);';
    const { rows } = await this.executeQuery<DbQueueMetrics>(query, [name]);
    return parseDbQueueMetrics(rows[0]);
  }

  public async getAllMetrics() {
    const query = 'SELECT * FROM pgmq.metrics_all()';
    const { rows } = await this.executeQuery<DbQueueMetrics>(query);
    return rows.map(parseDbQueueMetrics);
  }
}
