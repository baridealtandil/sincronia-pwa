import React, { useState, useEffect } from 'react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { LoginModal } from './components/LoginModal';
import { Navigation } from './components/Navigation';
import { PullToRefresh } from './components/PullToRefresh';
import { WizardStep1Project } from './components/WizardStep1Project';
import { WizardStep2SmartTasks } from './components/WizardStep2SmartTasks';
import { WizardStep3AssignTeam } from './components/WizardStep3AssignTeam';
import { WizardStep4Dashboard } from './components/WizardStep4Dashboard';
import { Project, Task, AppNotification, UserSession } from './types';
import { 
  getProjects, saveProjects, 
  getTasks, saveTasks, 
  getNotifications, saveNotifications, addNotification 
} from './services/storage';
import { isTaskAssignedToUser } from './utils/taskParser';

const USER_SESSION_KEY = 'synchro_user_session_v1';
const COLLABORATORS_KEY = 'synchro_collaborators_v1';

const PURGED_MOCK_NAMES = [
  'Sofía Gómez', 'Sofía Ruiz', 'Mateo Rodríguez', 
  'Lucas Fernández', 'Valentina Ruiz', 
  'Colaborador 1', 'Colaborador 2', 'Colaborador 3'
];

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>([]);

  // User Session State (Nombre y Apellido)
  const [userSession, setUserSession] = useState<UserSession>({
    firstName: '',
    lastName: '',
    fullName: '',
    isLoggedIn: false
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [step, setStep] = useState<'step1_project' | 'step2_tasks' | 'step3_assign' | 'step4_dashboard'>('step1_project');

  useEffect(() => {
    const p = getProjects();
    const t = getTasks();
    const n = getNotifications();

    let currentSession: UserSession = {
      firstName: '',
      lastName: '',
      fullName: '',
      isLoggedIn: false
    };

    // Check saved user session permanently
    const savedSession = localStorage.getItem(USER_SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && typeof parsed === 'object' && parsed.fullName && parsed.isLoggedIn !== false) {
          const fn = parsed.firstName || (parsed.fullName ? parsed.fullName.split(' ')[0] : '');
          const ln = parsed.lastName || (parsed.fullName ? parsed.fullName.split(' ').slice(1).join(' ') : '');
          const full = parsed.fullName || `${fn} ${ln}`.trim();
          currentSession = {
            firstName: fn || '',
            lastName: ln || '',
            fullName: full || '',
            isLoggedIn: true
          };
          setUserSession(currentSession);
          setIsLoginModalOpen(false);
        } else {
          setIsLoginModalOpen(true);
        }
      } catch {
        setIsLoginModalOpen(true);
      }
    } else {
      setIsLoginModalOpen(true);
    }

    // Load and sanitize collaborators list (no mock names, keep user-added collabs & logged-in user)
    const savedCollabs = localStorage.getItem(COLLABORATORS_KEY);
    let loadedCollabs: string[] = [];
    if (savedCollabs) {
      try {
        const parsed = JSON.parse(savedCollabs);
        if (Array.isArray(parsed)) {
          loadedCollabs = parsed.filter(c => c && typeof c === 'string' && !PURGED_MOCK_NAMES.includes(c.trim()));
        }
      } catch {}
    }

    if (currentSession.fullName && !loadedCollabs.includes(currentSession.fullName)) {
      loadedCollabs.unshift(currentSession.fullName);
    }

    setCollaborators(loadedCollabs);
    localStorage.setItem(COLLABORATORS_KEY, JSON.stringify(loadedCollabs));

    // Clean any tasks assigned to purged mock names -> assign to logged in user or creator
    const defaultAssignee = currentSession.fullName || (loadedCollabs.length > 0 ? loadedCollabs[0] : 'Gabriel Marcasso');
    const cleanedTasks = t.map(task => {
      if (PURGED_MOCK_NAMES.includes(task.assignedTo)) {
        return {
          ...task,
          assignedTo: defaultAssignee
        };
      }
      return task;
    });

    setProjects(p);
    setTasks(cleanedTasks);
    saveTasks(cleanedTasks);
    setNotifications(n);

    if (p.length > 0) {
      setActiveProjectId(p[0].id);
      setStep('step4_dashboard');
    } else {
      setStep('step1_project');
    }
  }, []);

  const handleSaveCollabsList = (list: string[]) => {
    const cleanList = Array.from(new Set(list))
      .filter(c => c && typeof c === 'string' && !PURGED_MOCK_NAMES.includes(c.trim()));
    setCollaborators(cleanList);
    localStorage.setItem(COLLABORATORS_KEY, JSON.stringify(cleanList));
  };

  const handleAddCollaborator = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !PURGED_MOCK_NAMES.includes(trimmed) && !collaborators.includes(trimmed)) {
      const updated = [...collaborators, trimmed];
      handleSaveCollabsList(updated);
    }
  };

  const handleEditCollaborator = (oldName: string, newName: string) => {
    const trimmedNew = newName.trim();
    if (!trimmedNew) return;
    const updatedCollabs = collaborators.map(c => c === oldName ? trimmedNew : c);
    handleSaveCollabsList(updatedCollabs);

    // Propagate new name to all assigned tasks
    const updatedTasks = tasks.map(t => {
      if (t.assignedTo === oldName) {
        return { ...t, assignedTo: trimmedNew };
      }
      return t;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const handleDeleteCollaborator = (name: string) => {
    const updatedCollabs = collaborators.filter(c => c !== name);
    handleSaveCollabsList(updatedCollabs);
  };

  const handleLogin = (firstName: string, lastName: string) => {
    const full = `${firstName} ${lastName}`.trim();
    const session: UserSession = {
      firstName,
      lastName,
      fullName: full,
      isLoggedIn: true
    };
    setUserSession(session);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));

    // Automatically add user's full name to collaborators list if not present
    if (full && !collaborators.includes(full)) {
      const updated = [full, ...collaborators.filter(c => !PURGED_MOCK_NAMES.includes(c))];
      handleSaveCollabsList(updated);
    }

    setIsLoginModalOpen(false);
  };

  // Step 1: Create Project
  const handleCreateProject = (name: string, leaderName: string) => {
    const newProj: Project = {
      id: 'proj-' + Date.now(),
      name,
      leaderName: leaderName || userSession.fullName || 'Creador',
      createdAt: new Date().toISOString()
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    saveProjects(updated);

    setActiveProjectId(newProj.id);
    setStep('step2_tasks');
  };

  const handleDeleteProject = (projId: string) => {
    const updatedP = projects.filter(p => p.id !== projId);
    const updatedT = tasks.filter(t => t.projectId !== projId);
    setProjects(updatedP);
    setTasks(updatedT);
    saveProjects(updatedP);
    saveTasks(updatedT);

    if (activeProjectId === projId) {
      setActiveProjectId(updatedP.length > 0 ? updatedP[0].id : null);
      if (updatedP.length === 0) setStep('step1_project');
    }
  };

  // Step 2: Add Multiple Detected Tasks
  const handleAddMultipleTasks = (taskTitles: string[]) => {
    if (!activeProjectId) return;

    const validCollabs = collaborators.filter(c => !PURGED_MOCK_NAMES.includes(c));
    if (userSession.fullName && !validCollabs.includes(userSession.fullName)) {
      validCollabs.unshift(userSession.fullName);
    }
    const defaultAssignee = userSession.fullName || (validCollabs.length > 0 ? validCollabs[0] : 'Gabriel Marcasso');
    const availablePool = validCollabs.length > 0 ? validCollabs : [defaultAssignee];

    const newTasksList: Task[] = taskTitles.map((title, idx) => ({
      id: 'task-' + Date.now() + '-' + idx,
      projectId: activeProjectId,
      title,
      assignedTo: availablePool[idx % availablePool.length],
      status: 'pendiente',
      createdAt: new Date().toISOString()
    }));

    const updated = [...tasks, ...newTasksList];
    setTasks(updated);
    saveTasks(updated);

    if (activeProjectId && newTasksList.length > 0) {
      addNotification({
        projectId: activeProjectId,
        title: `📥 ${newTasksList.length} ${newTasksList.length === 1 ? 'Nueva Tarea Asignada' : 'Nuevas Tareas Asignadas'}`,
        message: `Se cargaron ${newTasksList.length} tareas en el proyecto por ${userSession.fullName || 'el equipo'}.`,
        type: 'info'
      });
      setNotifications(getNotifications());
    }
  };

  // Step 3: Assign Task
  const handleAssignTask = (taskId: string, assigneeName: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, assignedTo: assigneeName };
      }
      return t;
    });
    setTasks(updated);
    saveTasks(updated);

    if (targetTask && activeProjectId) {
      addNotification({
        projectId: activeProjectId,
        title: '📥 Tarea Asignada',
        message: `La tarjeta "${targetTask.title}" fue asignada a ${assigneeName} por ${userSession.fullName || 'el equipo'}`,
        type: 'info'
      });
      setNotifications(getNotifications());
    }
  };

  // Reassign Task to another collaborator
  const handleReassignTask = (taskId: string, newAssignee: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          reassignedFrom: t.assignedTo,
          assignedTo: newAssignee,
          status: 'pendiente' as const,
          readBy: null,
          readAt: null,
          reassignedAt: new Date().toISOString()
        };
      }
      return t;
    });

    setTasks(updated);
    saveTasks(updated);

    if (targetTask && activeProjectId) {
      addNotification({
        projectId: activeProjectId,
        title: '🔄 Tarea Reasignada',
        message: `La tarjeta "${targetTask.title}" fue reasignada a ${newAssignee} por ${userSession.fullName}`,
        type: 'reassigned'
      });
      setNotifications(getNotifications());
    }
  };

  // Confirm Reading
  const handleConfirmReadTask = (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    const actorName = userSession.fullName || 'Usuario';
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: (t.status === 'completado' ? 'completado' : 'leido') as any,
          readBy: actorName,
          readAt: new Date().toISOString()
        };
      }
      return t;
    });

    setTasks(updated);
    saveTasks(updated);

    if (targetTask && activeProjectId) {
      addNotification({
        projectId: activeProjectId,
        title: '👁️ Tarea Leída',
        message: `¡${actorName} leyó la tarjeta: "${targetTask.title}"!`,
        type: 'read'
      });
      setNotifications(getNotifications());
    }
  };

  // Tildar 100% Terminada
  const handleCompleteTask = (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    const actorName = userSession.fullName || 'Usuario';
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'completado' as const,
          completedBy: actorName,
          completedAt: new Date().toISOString()
        };
      }
      return t;
    });

    setTasks(updated);
    saveTasks(updated);

    if (targetTask && activeProjectId) {
      addNotification({
        projectId: activeProjectId,
        title: '🎉 Tarea Finalizada 100%',
        message: `¡${actorName} tildó como terminada al 100% la tarjeta: "${targetTask.title}"!`,
        type: 'completed'
      });
      setNotifications(getNotifications());
    }
  };

  const handleRefreshData = async () => {
    const p = getProjects();
    const t = getTasks();
    const n = getNotifications();
    setProjects(p);
    setTasks(t);
    setNotifications(n);

    // Simulate smooth network/storage sync feedback
    await new Promise(resolve => setTimeout(resolve, 600));
  };

  const activeProject = (projects || []).find(p => p && p.id === activeProjectId) || (projects.length > 0 ? projects[0] : null);
  const activeTasks = activeProject ? (tasks || []).filter(t => t && t.projectId === activeProject.id) : [];
  const activeNotifications = activeProject ? (notifications || []).filter(n => n && n.projectId === activeProject.id) : [];

  const myUnreadCount = activeTasks.filter(t => 
    isTaskAssignedToUser(t.assignedTo, userSession.fullName, userSession.firstName) && t.status === 'pendiente'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white pb-20 sm:pb-12 w-full max-w-full overflow-x-hidden">
      
      {/* Top Header */}
      <HeaderNavbar
        userSession={userSession}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        myUnreadCount={myUnreadCount}
      />

      <PullToRefresh onRefresh={handleRefreshData}>
        {/* Main Container */}
        <main className="max-w-3xl mx-auto px-3 sm:px-6 pt-5 sm:pt-8 flex-1 w-full space-y-6">
          
          {/* Professional Navigation Bar */}
          <Navigation
            step={step}
            setStep={setStep}
            activeProject={activeProject}
            hasTasks={activeTasks.length > 0}
          />

        {/* Step 1: Project Card */}
        {step === 'step1_project' && (
          <WizardStep1Project
            projects={projects}
            activeProject={activeProject}
            onSelectProject={(p) => {
              setActiveProjectId(p.id);
              setStep('step4_dashboard');
            }}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onNextStep={() => setStep('step2_tasks')}
          />
        )}

        {/* Step 2: Smart Tasks Input Card */}
        {step === 'step2_tasks' && activeProject && (
          <WizardStep2SmartTasks
            project={activeProject}
            onAddMultipleTasks={handleAddMultipleTasks}
            onPrevStep={() => setStep('step1_project')}
            onNextStep={() => setStep('step3_assign')}
          />
        )}

        {/* Step 3: Assign Team Card with Collaborators Edit & Delete */}
        {step === 'step3_assign' && (
          <WizardStep3AssignTeam
            tasks={activeTasks}
            collaborators={collaborators}
            onAddCollaborator={handleAddCollaborator}
            onEditCollaborator={handleEditCollaborator}
            onDeleteCollaborator={handleDeleteCollaborator}
            onAssignTask={handleAssignTask}
            onPrevStep={() => setStep('step2_tasks')}
            onFinishStep={() => setStep('step4_dashboard')}
          />
        )}

        {/* Step 4: Professional Card Dashboard */}
        {step === 'step4_dashboard' && activeProject && (
          <WizardStep4Dashboard
            project={activeProject}
            tasks={activeTasks}
            notifications={activeNotifications}
            userName={userSession.fullName || 'Usuario'}
            userFirstName={userSession.firstName || 'Usuario'}
            collaborators={collaborators}
            onConfirmReadTask={handleConfirmReadTask}
            onCompleteTask={handleCompleteTask}
            onReassignTask={handleReassignTask}
            onNewProjectClick={() => setStep('step1_project')}
            onAddMoreTasksClick={() => setStep('step2_tasks')}
          />
        )}

      </main>
      </PullToRefresh>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLogin={handleLogin}
      />

    </div>
  );
};

export default App;
