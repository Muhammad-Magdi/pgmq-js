import { Client } from "pg";
import Pool from "pg-pool";
import { QueryExecuter } from "src/query-executer";

export class MsgManager extends QueryExecuter {
  constructor(pool: Pool<Client>) {
    super(pool);
  }

  public async send(q: string, msg: any, delay = 0): Promise<number> {
    const query = "SELECT * FROM pgmq.send($1, $2, $3)";
    const res = await this.executeQuery<{ send: number }>(query, [
      q,
      JSON.stringify(msg),
      delay,
    ]);
    return res.rows[0].send;
  }

  public async sendBatch(q: string, msgs: any[], delay = 0): Promise<number[]> {
    const query = "SELECT * FROM pgmq.send_batch($1, $2::jsonb[], $3)";
    const res = await this.executeQuery<{ send_batch: number }>(query, [
      q,
      msgs.map((m) => JSON.stringify(m)),
      delay,
    ]);

    return res.rows.flatMap((s) => s.send_batch);
  }
}
