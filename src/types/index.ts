export type Priority = 'alta' | 'media' | 'baja';

export type UserRole = 'leader' | 'collaborator';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo: string;
  priority: Priority;
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
  note?: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  leaderName: string;
  pin: string; // 4-digit PIN (default "1234")
  biometricRequired: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  taskTitle: string;
  timestamp: string;
}

export interface UserSession {
  name: string;
  role: UserRole;
  isAuthenticated: boolean;
}
