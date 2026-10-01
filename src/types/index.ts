export type Priority = 'alta' | 'media' | 'baja';

export type UserRole = 'leader' | 'manager' | 'subcollaborator';

export interface SubTask {
  id: string;
  parentTaskId: string;
  title: string;
  assignedTo: string; // Sub-colaborador asignado
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo: string; // Encargado principal
  priority: Priority;
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
  note?: string | null;
  createdAt: string;
  subtasks?: SubTask[]; // Sub-tareas delegadas a sub-colaboradores
}

export interface TeamMember {
  id: string;
  projectId: string;
  name: string;
  role: UserRole;
  invitedBy: string; // Quién lo invitó (Líder o Encargado)
  email?: string;
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
  members?: TeamMember[];
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
