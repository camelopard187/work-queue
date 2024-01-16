export class QueueLimitError extends Error {
  public readonly name = "QueueLimitError";
  public constructor(message: string) {
    super(message);
  }
}

export type QueueHandler<Input, Output> = (
  Input: Input,
  queue: WorkQueueExecutor<Input, Output>
) => Promise<Output>;

export interface WorkQueueExecutor<Input, Output> {
  push(...input: Input[]): this;
  process(handler: QueueHandler<Input, Output>): Promise<Output[]>;
}

export class SimpleWorkQueueExecutor<Input, Output>
  implements WorkQueueExecutor<Input, Output>
{
  private input: Input[] = [];

  public constructor(
    private readonly workers: number,
    private readonly size: number
  ) {}

  public push(...input: Input[]): this {
    if (this.size < this.input.length + input.length)
      throw new QueueLimitError("Queue is full");

    return this.input.push(...input), this;
  }

  public async process(
    handler: QueueHandler<Input, Output>
  ): Promise<Output[]> {
    const pending: Promise<void>[] = [];
    const fulfilled: Output[] = [];

    for (const input of this.input) {
      const task: Promise<void> = handler(input, this)
        .then((output) => fulfilled.push(output))
        .then(() => {
          pending.splice(pending.indexOf(task), 1);
        });

      pending.push(task);

      while (pending.length >= this.workers) {
        await Promise.race(pending);
      }
    }

    return fulfilled;
  }
}

export class SimpleWorkQueueExecutorDuplicate<Input, Output>
  implements WorkQueueExecutor<Input, Output>
{
  private input: Input[] = [];

  public constructor(
    private readonly workers: number,
    private readonly size: number
  ) {}

  public push(...input: Input[]): this {
    if (this.size < this.input.length + input.length)
      throw new QueueLimitError("Queue is full");

    return this.input.push(...input), this;
  }

  public async process(
    handler: QueueHandler<Input, Output>
  ): Promise<Output[]> {
    const pending: Promise<void>[] = [];
    const fulfilled: Output[] = [];

    for (const input of this.input) {
      const task: Promise<void> = handler(input, this)
        .then((output) => fulfilled.push(output))
        .then(() => {
          pending.splice(pending.indexOf(task), 1);
        });

      pending.push(task);

      while (pending.length >= this.workers) {
        await Promise.race(pending);
      }
    }

    return fulfilled;
  }
}
