import { Project, Task, ActivityLog } from '../types';

const PROJECTS_KEY = 'sincronia_projects_v1';
const TASKS_KEY = 'sincronia_tasks_v1';
const LOGS_KEY = 'sincronia_logs_v1';
const USER_PIN_KEY = 'sincronia_master_pin_v1';

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: '🚀 Lanzamiento Plataforma V2',
    description: 'Objetivos estratégicos para el despliegue global de la plataforma.',
    leaderName: 'Jefe de Proyecto (Admin)',
    pin: '1234',
    biometricRequired: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj-2',
    name: '🎨 Rediseño Móvil & PWA',
    description: 'Optimización de UX/UI para dispositivos iOS y Android.',
    leaderName: 'Jefe de Proyecto (Admin)',
    pin: '2026',
    biometricRequired: false,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Configurar Servidor WebSocket & Realtime',
    description: 'Establecer sincronización continua sin necesidad de refrescar la pantalla.',
    assignedTo: 'Martín G.',
    priority: 'alta',
    completed: true,
    completedBy: 'Martín G.',
    completedAt: new Date(Date.now() - 3600000).toISOString(),
    note: 'Infraestructura activa y lista para tráfico masivo.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Implementar Autenticación PIN (4 dígitos) + Face ID',
    description: 'Proteger el acceso a cada proyecto mediante contraseña o biometría.',
    assignedTo: 'Lucía M.',
    priority: 'alta',
    completed: true,
    completedBy: 'Lucía M.',
    completedAt: new Date(Date.now() - 1800000).toISOString(),
    note: 'Probado en iOS y Android con WebAuthn.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Subir PWA con Manifest e Ícono Adaptativo',
    description: 'Garantizar que la app sea instalable directamente en la pantalla de inicio.',
    assignedTo: 'Carlos R.',
    priority: 'media',
    completed: false,
    completedBy: null,
    completedAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-4',
    projectId: 'proj-1',
    title: 'Verificación Final y Despliegue en Producción',
    description: 'Tildar al 100% cuando el equipo valide la versión final.',
    assignedTo: 'Equipo Backend',
    priority: 'alta',
    completed: false,
    completedBy: null,
    completedAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-5',
    projectId: 'proj-2',
    title: 'Diseñar ícono de app PWA con estilo neón isometric',
    description: 'Generar versión de alta resolución de 512x512px.',
    assignedTo: 'Diseñador UI',
    priority: 'media',
    completed: true,
    completedBy: 'Sofía L.',
    completedAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    projectId: 'proj-1',
    userName: 'Martín G.',
    userRole: 'collaborator',
    action: 'completó al 100%',
    taskTitle: 'Configurar Servidor WebSocket & Realtime',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'log-2',
    projectId: 'proj-1',
    userName: 'Lucía M.',
    userRole: 'collaborator',
    action: 'completó al 100%',
    taskTitle: 'Implementar Autenticación PIN (4 dígitos) + Face ID',
    timestamp: new Date(Date.now() - 1800000).toISOString()
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

export const getTasks = (projectId?: string): Task[] => {
  const data = localStorage.getItem(TASKS_KEY);
  let tasks: Task[] = data ? JSON.parse(data) : DEFAULT_TASKS;
  if (!data) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(DEFAULT_TASKS));
  }
  if (projectId) {
    return tasks.filter(t => t.projectId === projectId);
  }
  return tasks;
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const getLogs = (projectId?: string): ActivityLog[] => {
  const data = localStorage.getItem(LOGS_KEY);
  let logs: ActivityLog[] = data ? JSON.parse(data) : DEFAULT_LOGS;
  if (!data) {
    localStorage.setItem(LOGS_KEY, JSON.stringify(DEFAULT_LOGS));
  }
  if (projectId) {
    return logs.filter(l => l.projectId === projectId);
  }
  return logs;
};

export const addLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
  const logs = getLogs();
  const newLog: ActivityLog = {
    ...log,
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString()
  };
  const updated = [newLog, ...logs].slice(0, 50); // Keep last 50 entries
  localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  return newLog;
};

export const getMasterPin = (): string => {
  return localStorage.getItem(USER_PIN_KEY) || '1234';
};

export const setMasterPin = (pin: string) => {
  localStorage.setItem(USER_PIN_KEY, pin);
};
