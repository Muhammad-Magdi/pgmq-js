export type Message<T> = {
  msgId: number;
  readCount: number;
  enqueuedAt: Date;
  vt: Date;
  message: T;
};

export type DbMessage = {
  msg_id: string;
  read_ct: string;
  enqueued_at: string;
  vt: string;
  message: string;
};
