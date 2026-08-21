import { randomUUID } from "node:crypto";

import { DeliveryTaskStore } from "./store.js";
import type {
  DispatchTask,
  IssueOpenedDelivery,
  MaintenanceTask,
  ProcessIssueResult
} from "./types.js";

export class IssueWebhookProcessor {
  constructor(
    private readonly store: DeliveryTaskStore,
    private readonly dispatchTask: DispatchTask
  ) {}

  async process(delivery: IssueOpenedDelivery): Promise<ProcessIssueResult> {
    const existing = await this.store.find(delivery.deliveryId);
    if (existing) {
      return { task: existing, newlyCreated: false };
    }

    await Promise.resolve();

    const task: MaintenanceTask = {
      taskId: randomUUID(),
      deliveryId: delivery.deliveryId,
      repository: delivery.repository,
      issueNumber: delivery.issueNumber
    };
    await this.store.save(task);
    await this.dispatchTask(task);
    return { task, newlyCreated: true };
  }
}
