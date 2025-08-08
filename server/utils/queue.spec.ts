import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { useQueue } from './queue';
import { Queue } from 'bullmq';

const TEST_QUEUE_NAME = 'test-queue';

// Set a test Redis URL for local/dev environments if not set
if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = 'redis://localhost:6379';
}

describe('useQueue', () => {
  let queue: Queue;

  beforeAll(() => {
    queue = useQueue(TEST_QUEUE_NAME);
  });

  afterAll(async () => {
    if (queue) {
      await queue.obliterate({ force: true });
      await queue.close();
    }
  });

  it('returns a Queue instance', () => {
    expect(queue).toBeInstanceOf(Queue);
    expect(queue.name).toBe(TEST_QUEUE_NAME);
  });

  it('returns the same instance for the same name', () => {
    const queue2 = useQueue(TEST_QUEUE_NAME);
    expect(queue2).toBe(queue);
  });

  it('adds and processes a job', async () => {
    const job = await queue.add('test-job', { foo: 'bar' });
    expect(job).toBeDefined();
    expect(job.name).toBe('test-job');
    expect(job.data).toEqual({ foo: 'bar' });
  });
});
