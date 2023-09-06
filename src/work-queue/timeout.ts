import type { QueueHandler, WorkQueueExecutor } from "@/work-queue/executor";

export class QueueTimeoutError extends Error {
  public readonly name = "QueueTimeoutError";
  public constructor(message: string) {
    super(message);
  }
}

export class TimeoutWorkQueueExecutor<Input, Output>
  implements WorkQueueExecutor<Input, Output>
{
  public constructor(
    private readonly queue: WorkQueueExecutor<Input, Output>,
    private readonly ms: number
  ) {}

  public push(...input: Input[]): this {
    return this.queue.push(...input), this;
  }

  public async process(
    handler: QueueHandler<Input, Output>
  ): Promise<Output[]> {
    return await Promise.race([
      new Promise<never>((_, reject) =>
        setTimeout(() => {
          const error = new QueueTimeoutError(
            "Time elapsed after start execution is greater than timeout"
          );

          return reject(error);
        }, this.ms)
      ),
      this.queue.process(handler),
    ]);
  }
}
