export interface Message<T> {
  msgId: number;
  readCount: number;
  enqueuedAt: Date;
  vt: Date;
  message: T;
}

export interface DbMessage {
  msg_id: string;
  read_ct: string;
  enqueued_at: string;
  vt: string;
  message: string;
}
