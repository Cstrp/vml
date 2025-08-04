import { type Processor, type WorkerOptions, Worker } from "bullmq";
import { Redis } from "ioredis";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const workerMap = new Map<string, Worker<any, any, any>>();

export const useWorker = <
  DataType = unknown,
  ResultType = unknown,
  NameType extends string = string,
>(
  name: string,
  fn: string | URL | Processor<DataType, ResultType, NameType>,
  opts?: Partial<Omit<WorkerOptions, "connection">>,
) => {
  if (workerMap.has(name)) {
    return workerMap.get(name) as unknown as Worker<DataType, ResultType, NameType>;
  }

  const { REDIS_URL } = process.env;

  if (!REDIS_URL) {
    throw new Error("env REDIS_URL is not defined");
  }

  const connection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  workerMap.set(name, new Worker<DataType, ResultType, NameType>(name, fn, { ...opts, connection }));

  return workerMap.get(name) as unknown as Worker<DataType, ResultType, NameType>;
};
