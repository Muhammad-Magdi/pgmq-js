export interface Queue {
  name: string;
  createdAt: Date;
  isPartitioned: boolean;
  isUnlogged: boolean;
}

export interface QueueMetrics {
  queueName: string;
  queueLength: number;
  newestMsgAgeSec?: number;
  oldestMsgAgeSec?: number;
  totalMessages: number;
  scrapeTime: Date;
}

export interface DbQueueMetrics {
  queue_name: string;
  queue_length: string;
  newest_msg_age_sec?: string;
  oldest_msg_age_sec?: string;
  total_messages: string;
  scrape_time: string;
}
