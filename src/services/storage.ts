import { Project, Task, AppNotification } from '../types';

const PROJECTS_KEY = 'sincronia_v3_projects';
const TASKS_KEY = 'sincronia_v3_tasks';
const NOTIFICATIONS_KEY = 'sincronia_v3_notifications';

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Lanzamiento de Campaña Q4',
    leaderName: 'Carlos (Líder)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj-2',
    name: 'Rediseño de Sitio Web',
    leaderName: 'María (Líder)',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Diseñar flyers promocionales en Canva',
    assignedTo: 'Sofía',
    status: 'leido',
    readBy: 'Sofía',
    readAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Publicar anuncios en redes sociales',
    assignedTo: 'Mateo',
    status: 'completado',
    readBy: 'Mateo',
    readAt: new Date(Date.now() - 7200000).toISOString(),
    completedBy: 'Mateo',
    completedAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Enviar reporte final de métricas al líder',
    assignedTo: 'Sofía',
    status: 'pendiente',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    projectId: 'proj-1',
    title: '👀 Lectura Confirmada',
    message: 'Sofía confirmó que leyó la tarea: "Diseñar flyers promocionales"',
    type: 'read',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false
  },
  {
    id: 'notif-2',
    projectId: 'proj-1',
    title: '🎉 Tarea Finalizada 100%',
    message: 'Mateo tildó como completada la tarea: "Publicar anuncios en redes sociales"',
    type: 'completed',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false
  }
];

export const getProjects = (): Project[] => {
  const data = localStorage.getItem(PROJECTS_KEY);
  if (!data) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(DEFAULT_PROJECTS));
    return DEFAULT_PROJECTS;
  }
  return JSON.parse(data);
};

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const getTasks = (): Task[] => {
  const data = localStorage.getItem(TASKS_KEY);
  if (!data) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(DEFAULT_TASKS));
    return DEFAULT_TASKS;
  }
  return JSON.parse(data);
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const getNotifications = (): AppNotification[] => {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!data) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    return DEFAULT_NOTIFICATIONS;
  }
  return JSON.parse(data);
};

export const saveNotifications = (notifications: AppNotification[]) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
  const current = getNotifications();
  const newNotif: AppNotification = {
    ...notif,
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    read: false
  };
  const updated = [newNotif, ...current].slice(0, 30);
  saveNotifications(updated);
  return newNotif;
};
