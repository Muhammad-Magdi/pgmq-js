import { Pgmq } from "../index";
import { faker } from "@faker-js/faker";

describe("QueueManager", () => {
  let pgmq: Pgmq;
  const deleteAllQueues = async (pgmq: Pgmq) => {
    const queues = await pgmq.queue.list();
    await Promise.all(queues.map((q) => pgmq.queue.drop(q.name)));
  };

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

  beforeEach(async () => await deleteAllQueues(pgmq));

  const queueNamed = (name: string) => ({
    name,
    isPartitioned: false,
    isUnlogged: false,
    createdAt: expect.any(Date),
  });

  describe("list", () => {
    it("returns an empty list; no queues", async () => {
      const queues = await pgmq.queue.list();
      expect(queues).toEqual([]);
    });

    it("returns a list of queues; one queue", async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);

      const queues = await pgmq.queue.list();

      expect(queues).toEqual([queueNamed(qName)]);
    });

    it("returns a list of queues; multiple queues", async () => {
      const qName1 = faker.string.alpha(10);
      const qName2 = faker.string.alpha(10);
      const qName3 = faker.string.alpha(10);
      await Promise.all([
        pgmq.queue.create(qName1),
        pgmq.queue.create(qName2),
        pgmq.queue.create(qName3),
      ]);

      const queues = await pgmq.queue.list();

      expect(queues).toHaveLength(3);
      expect(queues).toContainEqual(queueNamed(qName1));
      expect(queues).toContainEqual(queueNamed(qName2));
      expect(queues).toContainEqual(queueNamed(qName3));
    });
  });

  describe("create", () => {
    it("creates a queue", async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);

      const queues = await pgmq.queue.list();
      expect(queues).toContainEqual(queueNamed(qName));
    });

    it.todo("rejects existing queue names");
  });

  describe("drop", () => {
    it("drops a queue", async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);
      const queuesBeforeDropping = await pgmq.queue.list();
      expect(queuesBeforeDropping).toContainEqual(queueNamed(qName));

      await pgmq.queue.drop(qName);
      const queuesAfterDropping = await pgmq.queue.list();
      expect(queuesAfterDropping).not.toContainEqual(queueNamed(qName));
    });

    it.todo("does not drop a queue that does not exist");
  });
});
