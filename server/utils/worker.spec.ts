import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWorker, workerMap } from "./worker";
import { type Processor, Worker } from "bullmq";
import { Redis } from "ioredis";

vi.mock("bullmq", () => ({
  Worker: vi.fn().mockImplementation(() => ({
    name: "",
    close: vi.fn(),
  })),
}));

vi.mock("ioredis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.REDIS_URL;
  workerMap.clear();
});

describe("useWorker", () => {
  const mockProcessor: Processor<unknown, unknown, string> = async (job) => {
    return { result: `Processed ${job.id}` };
  };
  const mockName = "test-worker";
  const mockOpts = { concurrency: 5 };

  it("should create a new worker when name is not in map", () => {
    process.env.REDIS_URL = "redis://localhost:6379";

    const worker = useWorker(mockName, mockProcessor, mockOpts);

    expect(Worker).toHaveBeenCalledWith(
      mockName,
      mockProcessor,
      expect.objectContaining({
        ...mockOpts,
        connection: expect.objectContaining({
          disconnect: expect.any(Function),
        }),
      })
    );
    expect(worker).toBeDefined();
    expect(workerMap.get(mockName)).toBe(worker);
  });

  it("should reuse existing worker when name is already in map", () => {
    process.env.REDIS_URL = "redis://localhost:6379";

    const firstCall = useWorker(mockName, mockProcessor);
    const secondCall = useWorker(mockName, mockProcessor);

    expect(Worker).toHaveBeenCalledTimes(1); // Only called once
    expect(firstCall).toBe(secondCall);
    expect(workerMap.get(mockName)).toBe(firstCall);
  });

  it("should throw error when REDIS_URL is not defined", () => {
    expect(() => useWorker(mockName, mockProcessor)).toThrow("env REDIS_URL is not defined");
    expect(Worker).not.toHaveBeenCalled();
    expect(workerMap.get(mockName)).toBeUndefined();
  });

  it("should handle invalid processor (string or URL) gracefully", () => {
    process.env.REDIS_URL = "redis://localhost:6379";

    const mockFn = "invalid-processor"; // Invalid processor type
    const worker = useWorker(mockName, mockFn, mockOpts);

    expect(Worker).toHaveBeenCalledWith(
      mockName,
      mockFn,
      expect.objectContaining({
        ...mockOpts,
        connection: expect.objectContaining({
          disconnect: expect.any(Function),
        }),
      })
    );
    expect(worker).toBeDefined();
  });

  it("should pass custom options to Worker", () => {
    process.env.REDIS_URL = "redis://localhost:6379";

    const customOpts = { concurrency: 10, autorun: false };
    const worker = useWorker(mockName, mockProcessor, customOpts);

    expect(Worker).toHaveBeenCalledWith(
      mockName,
      mockProcessor,
      expect.objectContaining({
        ...customOpts,
        connection: expect.objectContaining({
          disconnect: expect.any(Function),
        }),
      })
    );
    expect(worker).toBeDefined();
  });

  it("should create Redis connection with correct options", () => {
    process.env.REDIS_URL = "redis://localhost:6379";

    useWorker(mockName, mockProcessor);

    expect(Redis).toHaveBeenCalledWith("redis://localhost:6379", {
      maxRetriesPerRequest: null,
    });
  });
});
