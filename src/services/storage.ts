import { Project, Task, SubTask, TeamMember, ActivityLog } from '../types';

const PROJECTS_KEY = 'sincronia_projects_v2';
const TASKS_KEY = 'sincronia_tasks_v2';
const LOGS_KEY = 'sincronia_logs_v2';
const MEMBERS_KEY = 'sincronia_members_v2';
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

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: 'mem-1',
    projectId: 'proj-1',
    name: 'Carlos V. (Jefe)',
    role: 'leader',
    invitedBy: 'Sistema',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mem-2',
    projectId: 'proj-1',
    name: 'Martín G. (Encargado)',
    role: 'manager',
    invitedBy: 'Carlos V. (Jefe)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mem-3',
    projectId: 'proj-1',
    name: 'Lucía M. (Encargada)',
    role: 'manager',
    invitedBy: 'Carlos V. (Jefe)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mem-4',
    projectId: 'proj-1',
    name: 'Esteban K. (Sub-colaborador)',
    role: 'subcollaborator',
    invitedBy: 'Martín G. (Encargado)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mem-5',
    projectId: 'proj-1',
    name: 'Valeria P. (Sub-colaboradora)',
    role: 'subcollaborator',
    invitedBy: 'Martín G. (Encargado)',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Configurar Servidor WebSocket & Realtime',
    description: 'Establecer sincronización continua sin necesidad de refrescar la pantalla.',
    assignedTo: 'Martín G. (Encargado)',
    priority: 'alta',
    completed: true,
    completedBy: 'Martín G. (Encargado)',
    completedAt: new Date(Date.now() - 3600000).toISOString(),
    note: 'Infraestructura activa y lista para tráfico masivo.',
    createdAt: new Date().toISOString(),
    subtasks: [
      {
        id: 'sub-1',
        parentTaskId: 'task-1',
        title: 'Verificar sockets en iOS y Android',
        assignedTo: 'Esteban K. (Sub-colaborador)',
        completed: true,
        completedBy: 'Esteban K. (Sub-colaborador)',
        completedAt: new Date(Date.now() - 4000000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'sub-2',
        parentTaskId: 'task-1',
        title: 'Configurar canal de redundancia LocalStorage',
        assignedTo: 'Valeria P. (Sub-colaboradora)',
        completed: true,
        completedBy: 'Valeria P. (Sub-colaboradora)',
        completedAt: new Date(Date.now() - 3800000).toISOString(),
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Implementar Autenticación PIN (4 dígitos) + Face ID',
    description: 'Proteger el acceso a cada proyecto mediante contraseña o biometría.',
    assignedTo: 'Lucía M. (Encargada)',
    priority: 'alta',
    completed: false,
    completedBy: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
    subtasks: [
      {
        id: 'sub-3',
        parentTaskId: 'task-2',
        title: 'Diseñar teclado numérico interactivo',
        assignedTo: 'Esteban K. (Sub-colaborador)',
        completed: true,
        completedBy: 'Esteban K. (Sub-colaborador)',
        completedAt: new Date(Date.now() - 1200000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'sub-4',
        parentTaskId: 'task-2',
        title: 'Integrar API WebAuthn navigator.credentials',
        assignedTo: 'Valeria P. (Sub-colaboradora)',
        completed: false,
        completedBy: null,
        completedAt: null,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Subir PWA con Manifest e Ícono Adaptativo',
    description: 'Garantizar que la app sea instalable directamente en la pantalla de inicio.',
    assignedTo: 'Martín G. (Encargado)',
    priority: 'media',
    completed: false,
    completedBy: null,
    completedAt: null,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    projectId: 'proj-1',
    userName: 'Martín G. (Encargado)',
    userRole: 'manager',
    action: 'delegó sub-tarea a Esteban K.',
    taskTitle: 'Verificar sockets en iOS y Android',
    timestamp: new Date(Date.now() - 4200000).toISOString()
  },
  {
    id: 'log-2',
    projectId: 'proj-1',
    userName: 'Esteban K. (Sub-colaborador)',
    userRole: 'subcollaborator',
    action: 'completó sub-tarea al 100%',
    taskTitle: 'Diseñar teclado numérico interactivo',
    timestamp: new Date(Date.now() - 1200000).toISOString()
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

export const getTeamMembers = (projectId?: string): TeamMember[] => {
  const data = localStorage.getItem(MEMBERS_KEY);
  let members: TeamMember[] = data ? JSON.parse(data) : DEFAULT_MEMBERS;
  if (!data) {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(DEFAULT_MEMBERS));
  }
  if (projectId) {
    return members.filter(m => m.projectId === projectId);
  }
  return members;
};

export const saveTeamMembers = (members: TeamMember[]) => {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
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
  const updated = [newLog, ...logs].slice(0, 50);
  localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  return newLog;
};

export const getMasterPin = (): string => {
  return localStorage.getItem(USER_PIN_KEY) || '1234';
};

export const setMasterPin = (pin: string) => {
  localStorage.setItem(USER_PIN_KEY, pin);
};
