import { faker } from "@faker-js/faker";
import { Pgmq } from "../index";

describe("MsgManager", () => {
  let pgmq: Pgmq;
  const qName = faker.string.alpha(10);
  beforeAll(async () => {
    pgmq = await Pgmq.new({
      host: "localhost",
      database: "postgres",
      password: "password",
      port: 5434,
      user: "postgres",
      ssl: false,
    });
  });

  beforeEach(async () => {
    await pgmq.queue.create(qName);
  });

  const deleteMessage = async (qName: string, id: number) => {
    await expect(pgmq.msg.delete(qName, id)).resolves.toBe(true);
  };

  const inputMsgs = [
    { msg: faker.number.int(), type: "int" },
    { msg: faker.number.float(), type: "float" },
    { msg: faker.string.alphanumeric(5), type: "string" },
    { msg: faker.datatype.boolean(), type: "boolean" },
    { msg: faker.string.alphanumeric(5).split(""), type: "array" },
    {
      msg: {
        a: faker.number.int(),
        b: faker.datatype.boolean(),
        c: faker.string.alphanumeric(5),
      },
      type: "object",
    },
    { msg: new Date(), type: "date" },
    { msg: null, type: "null" },
    { msg: undefined, type: "undefined" },
  ];

  const newMsg = <T>(msg: T) => ({
    enqueuedAt: expect.any(Date),
    message: msg,
    msgId: expect.any(Number),
    readCount: expect.any(Number),
    vt: expect.any(Date),
  });

  describe("send", () => {
    it.each(inputMsgs)("accepts $msg ($type) as a message", async ({ msg }) => {
      await pgmq.msg.send(qName, msg);
    });

    it("returns the unique message id", async () => {
      const id = await pgmq.msg.send(qName, "msg");
      await deleteMessage(qName, id);
    });
  });

  describe("sendBatch", () => {
    it("returns an array of message ids", async () => {
      const ids = await pgmq.msg.sendBatch(
        qName,
        inputMsgs.map((i) => i.msg)
      );
      await Promise.all(ids.map((id) => deleteMessage(qName, id)));
    });

    it("accepts empty arrays", async () => {
      const id = await pgmq.msg.sendBatch(qName, []);
      expect(id).toEqual([]);
    });
  });

  describe("read", () => {
    it("returns a message with its metadata", async () => {
      type T = { id: number; msg: string; date: Date; isGood: boolean };
      const msg = { id: 1, msg: "msg", isGood: true };
      await pgmq.msg.send(qName, msg);

      const readMsg = await pgmq.msg.read<T>(qName);

      expect(readMsg).toEqual(newMsg(msg));
    });

    it("returns undefined; queue is empty", async () => {
      const msg = await pgmq.msg.read(qName);
      expect(msg).toEqual(undefined);
    });

    it("returns undefined; all the messages are read", async () => {
      await pgmq.msg.sendBatch(qName, [1, 2]);

      const msg1 = await pgmq.msg.read<number>(qName);
      await deleteMessage(qName, msg1.msgId);
      const msg2 = await pgmq.msg.read<number>(qName);
      await deleteMessage(qName, msg2.msgId);
      const msg3 = await pgmq.msg.read<number>(qName);

      expect(msg1).toEqual(newMsg(1));
      expect(msg2).toEqual(newMsg(2));
      expect(msg3).toEqual(undefined);
    });

    it('does not read a read message within the "vt" window', async () => {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      type T = { id: number; msg: string; date: Date; isGood: boolean };
      const msg = { id: 1, msg: "msg", isGood: true };
      await pgmq.msg.send(qName, msg);
      const vt = 1;

      const readMsg = await pgmq.msg.read<T>(qName, vt);
      expect(readMsg).toEqual(newMsg(msg));
      const noMsg = await pgmq.msg.read<T>(qName, vt);
      expect(noMsg).toBeUndefined();
      await delay(vt * 1000);
      const readMsg2 = await pgmq.msg.read<T>(qName, vt);
      expect(readMsg2).toEqual(newMsg(msg));
    });

    it('rejects floating points in the "vt" window', async () => {
      type T = { id: number; msg: string; date: Date; isGood: boolean };
      const msg = { id: 1, msg: "msg", isGood: true };
      await pgmq.msg.send(qName, msg);

      await expect(() => pgmq.msg.read<T>(qName, 1.5)).rejects.toThrow();
    });
  });

  describe("readBatch", () => {
    it("returns an array of messages with their metadata", async () => {
      type T = { id: number; msg: string; date: Date; isGood: boolean };
      const msg1 = { id: 1, msg: "msg", isGood: true };
      const msg2 = { id: 1, msg: "msg", isGood: true };
      await pgmq.msg.sendBatch(qName, [msg1, msg2]);

      const [readMsg1, readMsg2] = await pgmq.msg.readBatch<T>(qName, 0, 2);

      expect(readMsg1).toEqual(newMsg(msg1));
      expect(readMsg2).toEqual(newMsg(msg2));
    });

    it("returns an empty array; queue is empty", async () => {
      const msgs = await pgmq.msg.readBatch<number>(qName, 0, 2);
      expect(msgs).toEqual([]);
    });
  });

  describe("delete", () => {
    it("returns true if message is deleted", async () => {
      const msg = "msg";
      const id = await pgmq.msg.send(qName, msg);

      const deleted = await pgmq.msg.delete(qName, id);

      expect(deleted).toBe(true);
    });

    it("deletes the message so that it can't be read again", async () => {
      const msg = "msg";
      const id = await pgmq.msg.send(qName, msg);

      const deleted = await pgmq.msg.delete(qName, id);

      expect(deleted).toBe(true);
      const read = await pgmq.msg.read<string>(qName);
      expect(read).toBeUndefined();
    });

    it("returns false if no such message id", async () => {
      const deleted = await pgmq.msg.delete(qName, 1);
      expect(deleted).toBe(false);
    });
  });

  afterEach(async () => {
    await pgmq.queue.drop(qName);
  });
});
