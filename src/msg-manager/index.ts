import { Client } from "pg";
import Pool from "pg-pool";
import { parseDbMessage } from "./helpers";
import { DbMessage, Message } from "src/msg-manager/types";
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

  public async read<T>(q: string, vt = 0): Promise<Message<T>> {
    return this.readBatch<T>(q, vt, 1).then((msgs) => msgs[0]);
  }

  public async readBatch<T>(
    q: string,
    vt: number,
    numMessages: number
  ): Promise<Message<T>[]> {
    const query = "SELECT * FROM pgmq.read($1, $2, $3)";
    const res = await this.executeQuery<DbMessage>(query, [q, vt, numMessages]);
    return res.rows.flatMap(parseDbMessage<T>) as Message<T>[];
  }

  public async pop<T>(q: string): Promise<Message<T> | undefined> {
    const query = "SELECT * FROM pgmq.pop($1)";
    const res = await this.executeQuery<DbMessage>(query, [q]);
    return parseDbMessage(res.rows[0]);
  }

  public async delete(q: string, msgId: number): Promise<boolean> {
    const query = "SELECT pgmq.delete($1, $2::bigint)";
    const res = await this.executeQuery<{ delete: boolean }>(query, [q, msgId]);
    return res.rows[0].delete;
  }

  public async deleteBatch(q: string, msgIds: number[]): Promise<number[]> {
    const query = "SELECT pgmq.delete($1, $2::bigint[])";
    const res = await this.executeQuery<{ delete: number }>(query, [q, msgIds]);
    return res.rows.flatMap((d) => d.delete);
  }
}
