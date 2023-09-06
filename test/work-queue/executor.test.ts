import { setTimeout } from "node:timers/promises";

import { SimpleWorkQueueExecutor } from "@/work-queue/executor";

type Input = { name: string };
type Output = { char?: string };

describe("SimpleWorkQueueExecutor", () => {
  it("should be capable of working with complex Input and Output", async () => {
    const output = await new SimpleWorkQueueExecutor<Input, Output>(1, 1)
      .push({ name: "123" })
      .process(async (input) => ({ char: input.name.at(0) }));

    expect(output).toEqual([{ char: "1" }]);
  });

  it("should returns all ResultValue-s in same order in which respective TaskValue-s were added", async () => {
    const output = await new SimpleWorkQueueExecutor<Input, Output>(1, 3)
      .push({ name: "1" }, { name: "2" }, { name: "3" })
      .process(async (input) => ({ char: input.name.at(0) }));

    expect(output).toEqual([{ char: "1" }, { char: "2" }, { char: "3" }]);
  });

  it("should does not accept more elements than QUEUE_SIZE", async () => {
    expect(() => {
      new SimpleWorkQueueExecutor<Input, Output>(1, 2)
        .push({ name: "1" })
        .push({ name: "2" })
        .push({ name: "3" });
    }).toThrow("Queue is full");
  });

  it("should does not execute more parallel tasks than MAX_WORKERS_NUM", async () => {
    const start = Date.now();

    await new SimpleWorkQueueExecutor<Input, void>(2, 4)
      .push({ name: "1" }, { name: "2" })
      .push({ name: "3" }, { name: "4" })
      .process(async () => await setTimeout(100));

    const end = Date.now();

    expect(end - start).toBeGreaterThan(150);
    expect(end - start).toBeLessThan(250);
  });

  it("should accepts and executes tasks after it started", async () => {
    const output = await new SimpleWorkQueueExecutor<Input, Output>(1, 3)
      .push({ name: "1" }, { name: "2" })
      .process(async (input, queue) => {
        if (input.name === "2") {
          queue.push({ name: "3" });
        }
        return { char: input.name.at(0)! };
      });

    expect(output).toEqual([{ char: "1" }, { char: "2" }, { char: "3" }]);
  });
});
