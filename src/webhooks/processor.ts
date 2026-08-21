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
    return this.store.getOrCreate(delivery.deliveryId, async () => {
      await Promise.resolve();
      const task: MaintenanceTask = {
        taskId: randomUUID(),
        deliveryId: delivery.deliveryId,
        repository: delivery.repository,
        issueNumber: delivery.issueNumber
      };
      await this.dispatchTask(task);
      return task;
    });
  }
}
