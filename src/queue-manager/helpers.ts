import { DbQueueMetrics, Queue, QueueMetrics } from './types';

export const parseDbQueue = (q: string): Queue => {
  const parts = q.substring(1, q.length - 1).split(',');
  return {
    name: parts[0],
    createdAt: new Date(parts[1]),
    isPartitioned: parts[2] === 't',
    isUnlogged: parts[3] === 't',
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
