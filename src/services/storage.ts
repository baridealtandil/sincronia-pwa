import { Project, Task, AppNotification } from '../types';

const PROJECTS_KEY = 'sincronia_v4_projects';
const TASKS_KEY = 'sincronia_v4_tasks';
const NOTIFICATIONS_KEY = 'sincronia_v4_notifications';

// Clean initial empty state for real project creation from scratch
export const getProjects = (): Project[] => {
  try {
    const data = localStorage.getItem(PROJECTS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveProjects = (projects: Project[]) => {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects || []));
  } catch (e) {
    console.error(e);
  }
};

export const getTasks = (): Task[] => {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks || []));
  } catch (e) {
    console.error(e);
  }
};

export const getNotifications = (): AppNotification[] => {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveNotifications = (notifications: AppNotification[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications || []));
  } catch (e) {
    console.error(e);
  }
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
