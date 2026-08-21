import type { MaintenanceTask } from "./types.js";

export class DeliveryTaskStore {
  private readonly tasks = new Map<string, MaintenanceTask>();

  async find(deliveryId: string): Promise<MaintenanceTask | undefined> {
    return this.tasks.get(deliveryId);
  }

  async save(task: MaintenanceTask): Promise<void> {
    this.tasks.set(task.deliveryId, task);
  }

  size(): number {
    return this.tasks.size;
  }
}
