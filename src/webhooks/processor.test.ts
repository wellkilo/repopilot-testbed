import { describe, expect, it, vi } from "vitest";

import { IssueWebhookProcessor } from "./processor.js";
import { DeliveryTaskStore } from "./store.js";
import type { IssueOpenedDelivery } from "./types.js";

const delivery: IssueOpenedDelivery = {
  deliveryId: "delivery-issue-42",
  repository: "wellkilo/repopilot-testbed",
  issueNumber: 42,
  title: "Duplicate maintenance task"
};

describe("IssueWebhookProcessor", () => {
  it("creates and dispatches one task for a new issue delivery", async () => {
    const dispatchTask = vi.fn(async () => undefined);
    const store = new DeliveryTaskStore();
    const processor = new IssueWebhookProcessor(store, dispatchTask);

    const result = await processor.process(delivery);

    expect(result.newlyCreated).toBe(true);
    expect(result.task.deliveryId).toBe(delivery.deliveryId);
    expect(store.size()).toBe(1);
    expect(dispatchTask).toHaveBeenCalledOnce();
  });

  it("deduplicates concurrent retries of the same GitHub delivery", async () => {
    const dispatchTask = vi.fn(async () => undefined);
    const store = new DeliveryTaskStore();
    const processor = new IssueWebhookProcessor(store, dispatchTask);

    const [first, second] = await Promise.all([
      processor.process(delivery),
      processor.process(delivery)
    ]);

    expect(first.task.taskId).toBe(second.task.taskId);
    expect([first.newlyCreated, second.newlyCreated].sort()).toEqual([false, true]);
    expect(store.size()).toBe(1);
    expect(dispatchTask).toHaveBeenCalledOnce();
  });

  it("returns the existing task for a sequential retry", async () => {
    const dispatchTask = vi.fn(async () => undefined);
    const store = new DeliveryTaskStore();
    const processor = new IssueWebhookProcessor(store, dispatchTask);

    const first = await processor.process(delivery);
    const retry = await processor.process(delivery);

    expect(retry).toEqual({ task: first.task, newlyCreated: false });
    expect(dispatchTask).toHaveBeenCalledOnce();
  });

  it("processes different delivery IDs independently", async () => {
    const dispatchTask = vi.fn(async () => undefined);
    const store = new DeliveryTaskStore();
    const processor = new IssueWebhookProcessor(store, dispatchTask);

    const [first, second] = await Promise.all([
      processor.process(delivery),
      processor.process({ ...delivery, deliveryId: "delivery-issue-43", issueNumber: 43 })
    ]);

    expect(first.task.taskId).not.toBe(second.task.taskId);
    expect(first.newlyCreated).toBe(true);
    expect(second.newlyCreated).toBe(true);
    expect(store.size()).toBe(2);
    expect(dispatchTask).toHaveBeenCalledTimes(2);
  });
});
