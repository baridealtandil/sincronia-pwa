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

const DEFAULT_COLLABS = ['Sofía Gómez', 'Mateo Rodríguez', 'Lucas Fernández', 'Valentina Ruiz'];

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>(DEFAULT_COLLABS);

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

    setProjects(p);
    setTasks(t);
    setNotifications(n);

    // Load saved collaborators list
    const savedCollabs = localStorage.getItem(COLLABORATORS_KEY);
    if (savedCollabs) {
      try {
        setCollaborators(JSON.parse(savedCollabs));
      } catch {
        setCollaborators(DEFAULT_COLLABS);
      }
    }

    // Check saved user session
    const savedSession = localStorage.getItem(USER_SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && typeof parsed === 'object') {
          const fn = parsed.firstName || (parsed.fullName ? parsed.fullName.split(' ')[0] : '');
          const ln = parsed.lastName || (parsed.fullName ? parsed.fullName.split(' ').slice(1).join(' ') : '');
          const full = parsed.fullName || `${fn} ${ln}`.trim();
          setUserSession({
            firstName: fn || '',
            lastName: ln || '',
            fullName: full || '',
            isLoggedIn: Boolean(parsed.isLoggedIn && full)
          });
          if (!full) setIsLoginModalOpen(true);
        } else {
          setIsLoginModalOpen(true);
        }
      } catch {
        setIsLoginModalOpen(true);
      }
    } else {
      setIsLoginModalOpen(true);
    }

    if (p.length > 0) {
      setActiveProjectId(p[0].id);
      setStep('step4_dashboard');
    } else {
      setStep('step1_project');
    }
  }, []);

  const handleSaveCollabsList = (list: string[]) => {
    setCollaborators(list);
    localStorage.setItem(COLLABORATORS_KEY, JSON.stringify(list));
  };

  const handleAddCollaborator = (name: string) => {
    if (!collaborators.includes(name)) {
      const updated = [...collaborators, name];
      handleSaveCollabsList(updated);
    }
  };

  const handleEditCollaborator = (oldName: string, newName: string) => {
    const updatedCollabs = collaborators.map(c => c === oldName ? newName : c);
    handleSaveCollabsList(updatedCollabs);

    // Propagate new name to all assigned tasks
    const updatedTasks = tasks.map(t => {
      if (t.assignedTo === oldName) {
        return { ...t, assignedTo: newName };
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
    const session: UserSession = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      isLoggedIn: true
    };
    setUserSession(session);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));

    // Also add to collaborators list if not already present
    if (`${firstName} ${lastName}`.trim()) {
      handleAddCollaborator(`${firstName} ${lastName}`.trim());
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

    const availableCollabs = collaborators.length > 0 ? collaborators : DEFAULT_COLLABS;
    const newTasksList: Task[] = taskTitles.map((title, idx) => ({
      id: 'task-' + Date.now() + '-' + idx,
      projectId: activeProjectId,
      title,
      assignedTo: availableCollabs[idx % availableCollabs.length],
      status: 'pendiente',
      createdAt: new Date().toISOString()
    }));

    const updated = [...tasks, ...newTasksList];
    setTasks(updated);
    saveTasks(updated);
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

  // Collaborator Step A: Confirm Reading
  const handleConfirmReadTask = (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    const actorName = userSession.fullName || 'Colaborador';
    const updated = tasks.map(t => {
      if (t.id === taskId && t.status === 'pendiente') {
        return {
          ...t,
          status: 'leido' as const,
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
        title: '👀 Lectura Confirmada',
        message: `${actorName} confirmó que leyó la tarjeta: "${targetTask.title}"`,
        type: 'read'
      });
      setNotifications(getNotifications());
    }
  };

  // Collaborator Step B: Complete Task 100%
  const handleCompleteTask = (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    const actorName = userSession.fullName || 'Colaborador';
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
          
          {/* Professional Navigation Bar (Segmented on desktop, bottom dock on mobile) */}
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
