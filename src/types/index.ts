export type TaskStatus = 'pendiente' | 'leido' | 'completado';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo: string;
  status: TaskStatus;
  readBy?: string | null;
  readAt?: string | null;
  completedBy?: string | null;
  completedAt?: string | null;
  reassignedFrom?: string | null;
  reassignedAt?: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  leaderName: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  projectId: string;
  title: string;
  message: string;
  type: 'read' | 'completed' | 'reassigned' | 'info';
  timestamp: string;
  read: boolean;
}

export type WizardStep = 'step1_project' | 'step2_tasks' | 'step3_assign' | 'step4_dashboard';
