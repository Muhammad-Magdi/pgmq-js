import { Client, QueryResultRow } from 'pg';
import Pool from 'pg-pool';

export class QueryExecuter {
  constructor(protected readonly pool: Pool<Client>) {}

  protected async executeQuery<T extends QueryResultRow>(query: string, params?: any[]) {
    const client = await this.pool.connect();

    try {
      return await client.query<T>(query, params);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
}
