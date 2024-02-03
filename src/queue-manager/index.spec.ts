import { Pgmq } from '../index';
import { faker } from '@faker-js/faker';

describe('QueueManager', () => {
  let pgmq: Pgmq;
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
    it.skip('returns an empty list; no queues', async () => {
      const queues = await pgmq.queue.list();
      expect(queues).toEqual([]);
    });

    it('returns a list of queues; one queue', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);

      const queues = await pgmq.queue.list();

      expect(queues).toContainEqual(newQueue(qName));

      await pgmq.queue.drop(qName);
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

      expect(queues.length).toBeGreaterThanOrEqual(3);
      expect(queues).toContainEqual(newQueue(qName1));
      expect(queues).toContainEqual(newQueue(qName2));
      expect(queues).toContainEqual(newQueue(qName3));

      await Promise.all([qName1, qName2, qName3].map((q) => pgmq.queue.drop(q)));
    });
  });

  describe('create', () => {
    it('creates a queue', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);

      const queues = await pgmq.queue.list();
      expect(queues).toContainEqual(newQueue(qName));

      await pgmq.queue.drop(qName);
    });

    it('rejects existing queue names', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);
      await expect(pgmq.queue.create(qName)).rejects.toThrow();

      await pgmq.queue.drop(qName);
    });
  });

  describe('createUnlogged', () => {
    it('creates an unlogged queue', async () => {
      const qName = faker.string.alpha(10);

      await pgmq.queue.createUnlogged(qName);

      const queues = await pgmq.queue.list();
      expect(queues).toContainEqual(newQueue(qName, true));

      await pgmq.queue.drop(qName);
    });

    it('fails to create an unlogged queue with the same name as an existing logged queue', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);

      await expect(pgmq.queue.createUnlogged(qName)).rejects.toThrow();

      const queues = await pgmq.queue.list();
      expect(queues).toContainEqual(newQueue(qName));

      await pgmq.queue.drop(qName);
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

      await pgmq.queue.drop(qName);
    });
  });

  const emptyQueueMetrics = (qName: string) => ({
    queueName: qName,
    queueLength: 0,
    scrapeTime: expect.any(Date) as Date,
    newestMsgAgeSec: undefined,
    oldestMsgAgeSec: undefined,
    totalMessages: 0,
  });

  describe('getMetrics', () => {
    it('returns empty queue metrics', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);

      const metrics = await pgmq.queue.getMetrics(qName);

      expect(metrics).toEqual(emptyQueueMetrics(qName));
      expect(metrics.scrapeTime.valueOf()).toBeCloseTo(Date.now(), -2);

      await pgmq.queue.drop(qName);
    });

    it('returns queue metrics', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);
      await pgmq.msg.sendBatch(qName, ['msg1', { key: 'msg2' }, 3, 4.0]);

      const metrics = await pgmq.queue.getMetrics(qName);

      expect(metrics).toEqual({
        queueName: qName,
        queueLength: 4,
        scrapeTime: expect.any(Date) as Date,
        newestMsgAgeSec: expect.closeTo(0, -1) as number,
        oldestMsgAgeSec: expect.closeTo(0, -1) as number,
        totalMessages: 4,
      });

      await pgmq.queue.drop(qName);
    });

    it('rejects when queue does not exist', async () => {
      await expect(pgmq.queue.getMetrics(faker.string.alpha(10))).rejects.toThrow();
    });
  });

  describe('getAllMetrics', () => {
    it('returns empty metrics', async () => {
      const metrics = await pgmq.queue.getAllMetrics();
      expect(metrics).toEqual([]);
    });

    it('returns metrics of a single queue', async () => {
      const qName = faker.string.alpha(10);
      await pgmq.queue.create(qName);
      await pgmq.msg.sendBatch(qName, ['msg1', { key: 'msg2' }, 3, 4.0]);

      const metrics = await pgmq.queue.getAllMetrics();

      expect(metrics).toEqual([
        {
          queueName: qName,
          queueLength: 4,
          scrapeTime: expect.any(Date) as Date,
          newestMsgAgeSec: expect.closeTo(0, -1) as number,
          oldestMsgAgeSec: expect.closeTo(0, -1) as number,
          totalMessages: 4,
        },
      ]);

      await pgmq.queue.drop(qName);
    });

    it('returns metrics of multiple queues', async () => {
      const qName1 = faker.string.alpha(10);
      const qName2 = faker.string.alpha(10);
      await Promise.all([pgmq.queue.create(qName1), pgmq.queue.create(qName2)]);

      const metrics = await pgmq.queue.getAllMetrics();

      expect(metrics).toContainEqual(emptyQueueMetrics(qName1));
      expect(metrics).toContainEqual(emptyQueueMetrics(qName2));

      await Promise.all([pgmq.queue.drop(qName1), pgmq.queue.drop(qName2)]);
    });
  });

  afterAll(async () => {
    await pgmq.close();
  });
});
