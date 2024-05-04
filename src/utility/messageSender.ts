const { Queue } = require('bullmq');

const connectionRedis = {
  host: 'redis-3bd483dc-kiamhasan267-2de6.a.aivencloud.com',
  port: '26246',
  username: 'default',
  password: 'AVNS_w_Y8mr85-XNX94mr9AL',
};

type QueueINIT = (name: string) => void;

export function queueINIT(name: string) {
  const queue = new Queue(name, { connection: connectionRedis });
  return queue;
}
