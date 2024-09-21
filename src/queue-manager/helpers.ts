import { DbQueueMetrics, Queue, QueueMetrics } from './types';

export const parseDbQueue = (q: string): Queue => {
  const parts = q.substring(1, q.length - 1).split(',');
  return {
    name: parts[0],
    isPartitioned: parts[1] === 't',
    isUnlogged: parts[2] === 't',
    createdAt: new Date(parts[3]),
  };
};

export const parseDbQueueMetrics = (m: DbQueueMetrics): QueueMetrics => ({
  queueName: m.queue_name,
  queueLength: parseInt(m.queue_length),
  newestMsgAgeSec: m.newest_msg_age_sec != null ? parseInt(m.newest_msg_age_sec) : undefined,
  oldestMsgAgeSec: m.oldest_msg_age_sec != null ? parseInt(m.oldest_msg_age_sec) : undefined,
  totalMessages: parseInt(m.total_messages),
  scrapeTime: new Date(m.scrape_time),
});
