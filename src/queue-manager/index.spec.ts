import { Pgmq } from '../index';
import { faker } from '@faker-js/faker';

describe('QueueManager', () => {
  let pgmq: Pgmq;
  const deleteAllQueues = async (pgmq: Pgmq) => {
    const queues = await pgmq.queue.list();
    await Promise.all(queues.map((q) => pgmq.queue.drop(q.name)));
  };

  beforeAll(async () => {
    pgmq = await Pgmq.new({
      host: 'localhost',
      database: 'postgres',
      password: 'password',
      port: 5432,
      user: 'postgres',
      ssl: false,
    });
  });

  const newQueue = (name: string, isUnlogged = false) => ({
    name,
    isPartitioned: false,
    isUnlogged,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    createdAt: expect.any(Date),
  });

  describe('list', () => {
    it('returns an empty list; no queues', async () => {
      await deleteAllQueues(pgmq);
      const queues = await pgmq.queue.list();
      expect(queues).toEqual([]);
    });

    it('returns a list of queues; one queue', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);

      const queues = await pgmq.queue.list();

      expect(queues).toEqual([newQueue(qName)]);
    });

    it('returns a list of queues; multiple queues', async () => {
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
      expect(queues).toContainEqual(newQueue(qName1));
      expect(queues).toContainEqual(newQueue(qName2));
      expect(queues).toContainEqual(newQueue(qName3));
    });
  });

  describe('create', () => {
    it('creates a queue', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);

      const queues = await pgmq.queue.list();
      expect(queues).toContainEqual(newQueue(qName));
    });

    it('rejects existing queue names', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);
      await expect(pgmq.queue.create(qName)).rejects.toThrow();
    });
  });

  describe('createUnlogged', () => {
    it('creates an unlogged queue', async () => {
      const qName = faker.string.alpha(10);

      await pgmq.queue.createUnlogged(qName);

      const queues = await pgmq.queue.list();
      expect(queues).toContainEqual(newQueue(qName, true));
    });

    it('fails to create an unlogged queue with the same name as an existing logged queue', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);

      await expect(pgmq.queue.createUnlogged(qName)).rejects.toThrow();

      const queues = await pgmq.queue.list();
      expect(queues).toContainEqual(newQueue(qName));
    });
  });

  describe('drop', () => {
    it('drops the queue', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);

      await pgmq.queue.drop(qName);

      const queues = await pgmq.queue.list();
      expect(queues).not.toContainEqual(newQueue(qName));
    });

    it('fails to drop non-existing queue', async () => {
      const qName = faker.string.alpha(10);
      await expect(pgmq.queue.drop(qName)).rejects.toThrow();
    });
  });

  describe('purge', () => {
    it('does not throw', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);
      await pgmq.queue.purge(qName);
    });
  });

  afterEach(async () => {
    await deleteAllQueues(pgmq);
  });
});
