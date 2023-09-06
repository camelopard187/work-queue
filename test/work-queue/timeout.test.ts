import { setTimeout } from "node:timers/promises";

import { TimeoutWorkQueueExecutor } from "@/work-queue/timeout";
import { SimpleWorkQueueExecutor } from "@/work-queue/executor";

type Input = { name: string };

describe("TimeoutWorkQueueExecutor", () => {
  it("should does not work longer than QUEUE_TIMEOUT", async () => {
    await expect(async () => {
      await new TimeoutWorkQueueExecutor<Input, void>(
        new SimpleWorkQueueExecutor<Input, void>(1, 3)
          .push({ name: "1" })
          .push({ name: "2" }),
        200
      ).process(async () => await setTimeout(200));
    }).rejects.toThrow(
      "Time elapsed after start execution is greater than timeout"
    );
  });
});
