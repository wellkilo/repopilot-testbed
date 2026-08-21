import type { MaintenanceTask, StoredTaskResult } from "./types.js";

export class DeliveryTaskStore {
  private readonly tasks = new Map<string, MaintenanceTask>();
  private readonly inFlight = new Map<string, Promise<StoredTaskResult>>();

  async getOrCreate(
    deliveryId: string,
    createTask: () => Promise<MaintenanceTask>
  ): Promise<StoredTaskResult> {
    const existing = this.tasks.get(deliveryId);
    if (existing) {
      return { task: existing, newlyCreated: false };
    }

    const pending = this.inFlight.get(deliveryId);
    if (pending) {
      const result = await pending;
      return { task: result.task, newlyCreated: false };
    }

    const creation = createTask()
      .then((task) => {
        this.tasks.set(deliveryId, task);
        return { task, newlyCreated: true };
      })
      .finally(() => {
        this.inFlight.delete(deliveryId);
      });
    this.inFlight.set(deliveryId, creation);
    return creation;
  }

  size(): number {
    return this.tasks.size;
  }
}
