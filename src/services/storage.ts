import { Project, Task, AppNotification } from '../types';

const PROJECTS_KEY = 'sincronia_v4_projects';
const TASKS_KEY = 'sincronia_v4_tasks';
const NOTIFICATIONS_KEY = 'sincronia_v4_notifications';

// Clean initial empty state for real project creation from scratch
export const getProjects = (): Project[] => {
  const data = localStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const getTasks = (): Task[] => {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const getNotifications = (): AppNotification[] => {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  return data ? JSON.parse(data) : [];
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
