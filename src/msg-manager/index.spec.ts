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

  afterAll(async () => {
    await pgmq.queue.drop(qName);
  });
});
