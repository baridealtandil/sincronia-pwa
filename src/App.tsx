import React, { useState, useEffect } from 'react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { WizardStep1Project } from './components/WizardStep1Project';
import { WizardStep2SmartTasks } from './components/WizardStep2SmartTasks';
import { WizardStep3AssignTeam } from './components/WizardStep3AssignTeam';
import { WizardStep4Dashboard } from './components/WizardStep4Dashboard';
import { Project, Task, AppNotification } from './types';
import { 
  getProjects, saveProjects, 
  getTasks, saveTasks, 
  getNotifications, saveNotifications, addNotification 
} from './services/storage';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [userRole, setUserRole] = useState<'leader' | 'collaborator'>('leader');
  const [userName, setUserName] = useState<string>('Carlos (Líder)');

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [step, setStep] = useState<'step1_project' | 'step2_tasks' | 'step3_assign' | 'step4_dashboard'>('step1_project');

  useEffect(() => {
    const p = getProjects();
    const t = getTasks();
    const n = getNotifications();

    setProjects(p);
    setTasks(t);
    setNotifications(n);

    if (p.length > 0) {
      setActiveProjectId(p[0].id);
      setStep('step4_dashboard');
    }
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const activeTasks = tasks.filter(t => t.projectId === activeProjectId);

  // Step 1: Create Project
  const handleCreateProject = (name: string, leaderName: string) => {
    const newProj: Project = {
      id: 'proj-' + Date.now(),
      name,
      leaderName,
      createdAt: new Date().toISOString()
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    saveProjects(updated);

    setActiveProjectId(newProj.id);
    setStep('step2_tasks');
  };

  // Step 2: Add Multiple Detected Tasks
  const handleAddMultipleTasks = (taskTitles: string[]) => {
    if (!activeProjectId) return;

    const newTasksList: Task[] = taskTitles.map((title, idx) => ({
      id: 'task-' + Date.now() + '-' + idx,
      projectId: activeProjectId,
      title,
      assignedTo: idx % 2 === 0 ? 'Sofía' : 'Mateo',
      status: 'pendiente',
      createdAt: new Date().toISOString()
    }));

    const updated = [...tasks, ...newTasksList];
    setTasks(updated);
    saveTasks(updated);
  };

  // Step 3: Assign Task
  const handleAssignTask = (taskId: string, assigneeName: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, assignedTo: assigneeName };
      }
      return t;
    });
    setTasks(updated);
    saveTasks(updated);
  };

  // Collaborator Step A: Confirm Reading
  const handleConfirmReadTask = (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    const updated = tasks.map(t => {
      if (t.id === taskId && t.status === 'pendiente') {
        return {
          ...t,
          status: 'leido' as const,
          readBy: userName,
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
        message: `${userName} confirmó que leyó la tarea: "${targetTask.title}"`,
        type: 'read'
      });
      setNotifications(getNotifications());
    }
  };

  // Collaborator Step B: Complete Task 100%
  const handleCompleteTask = (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'completado' as const,
          completedBy: userName,
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
        message: `¡${userName} tildó como terminada la tarea: "${targetTask.title}"!`,
        type: 'completed'
      });
      setNotifications(getNotifications());
    }
  };

  const handleMarkNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-12">
      
      {/* Top Header */}
      <HeaderNavbar
        userRole={userRole}
        userName={userName}
        notifications={notifications.filter(n => n.projectId === activeProjectId)}
        onRoleChange={setUserRole}
        onUserNameChange={setUserName}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-8 flex-1 w-full space-y-6">
        
        {/* Wizard Card Steps Navigation indicator */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setStep('step1_project')}
            className={`px-3 py-1 rounded-full border transition-all ${
              step === 'step1_project'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            1. Proyecto
          </button>
          <span className="text-slate-600">→</span>
          <button
            onClick={() => setStep('step2_tasks')}
            disabled={!activeProject}
            className={`px-3 py-1 rounded-full border transition-all ${
              step === 'step2_tasks'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white disabled:opacity-40'
            }`}
          >
            2. Tareas
          </button>
          <span className="text-slate-600">→</span>
          <button
            onClick={() => setStep('step3_assign')}
            disabled={!activeProject || activeTasks.length === 0}
            className={`px-3 py-1 rounded-full border transition-all ${
              step === 'step3_assign'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white disabled:opacity-40'
            }`}
          >
            3. Asignar
          </button>
          <span className="text-slate-600">→</span>
          <button
            onClick={() => setStep('step4_dashboard')}
            disabled={!activeProject}
            className={`px-3 py-1 rounded-full border transition-all ${
              step === 'step4_dashboard'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white disabled:opacity-40'
            }`}
          >
            4. Tablero & Notificaciones
          </button>
        </div>

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

        {/* Step 3: Assign Team Card */}
        {step === 'step3_assign' && (
          <WizardStep3AssignTeam
            tasks={activeTasks}
            onAssignTask={handleAssignTask}
            onPrevStep={() => setStep('step2_tasks')}
            onFinishStep={() => setStep('step4_dashboard')}
          />
        )}

        {/* Step 4: Simple Dashboard & Confirmations */}
        {step === 'step4_dashboard' && activeProject && (
          <WizardStep4Dashboard
            project={activeProject}
            tasks={activeTasks}
            userRole={userRole}
            userName={userName}
            onConfirmReadTask={handleConfirmReadTask}
            onCompleteTask={handleCompleteTask}
            onNewProjectClick={() => setStep('step1_project')}
            onAddMoreTasksClick={() => setStep('step2_tasks')}
          />
        )}

      </main>

    </div>
  );
};

export default App;
