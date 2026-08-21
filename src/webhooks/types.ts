export interface IssueOpenedDelivery {
  deliveryId: string;
  repository: string;
  issueNumber: number;
  title: string;
}

export interface MaintenanceTask {
  taskId: string;
  deliveryId: string;
  repository: string;
  issueNumber: number;
}

export interface ProcessIssueResult {
  task: MaintenanceTask;
  newlyCreated: boolean;
}

export type DispatchTask = (task: MaintenanceTask) => Promise<void>;
