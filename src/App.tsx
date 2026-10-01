import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProjectSelector } from './components/ProjectSelector';
import { TaskBoard } from './components/TaskBoard';
import { ActivityFeed } from './components/ActivityFeed';
import { PinLockModal } from './components/PinLockModal';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { Project, Task, ActivityLog, UserRole } from './types';
import { 
  getProjects, saveProjects, 
  getTasks, saveTasks, 
  getLogs, addLog, 
  getMasterPin, setMasterPin 
} from './services/storage';
import { broadcastSync, subscribeToSync } from './services/realtime';
import { KeyRound, ShieldAlert, Sparkles, CheckCircle, Smartphone } from 'lucide-react';

export const App: React.FC = () => {
  // Application Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Active Context & Role
  const [userRole, setUserRole] = useState<UserRole>('collaborator');
  const [userName, setUserName] = useState<string>('Juan Colaborador');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Security Lock State
  const [unlockedProjects, setUnlockedProjects] = useState<Record<string, boolean>>({});
  const [pendingLockProject, setPendingLockProject] = useState<Project | null>(null);
  
  // Master PIN Config Modal
  const [isChangingMasterPin, setIsChangingMasterPin] = useState(false);
  const [newMasterPinInput, setNewMasterPinInput] = useState('');

  // PWA Install Prompt
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  // Load Initial Data
  useEffect(() => {
    const loadedProjects = getProjects();
    const loadedTasks = getTasks();
    const loadedLogs = getLogs();

    setProjects(loadedProjects);
    setTasks(loadedTasks);
    setLogs(loadedLogs);

    if (loadedProjects.length > 0) {
      setActiveProjectId(loadedProjects[0].id);
    }
  }, []);

  // Listen for Realtime Sync events from other tabs or devices
  useEffect(() => {
    const unsubscribe = subscribeToSync((payload) => {
      // Reload fresh data on any broadcast sync
      setProjects(getProjects());
      setTasks(getTasks());
      setLogs(getLogs());
    });
    return () => unsubscribe();
  }, []);

  // PWA Install Event Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(() => {
        setDeferredInstallPrompt(null);
      });
    }
  };

  // Select project handler (triggers PIN / Face ID unlock if not unlocked yet)
  const handleSelectProject = (project: Project) => {
    if (unlockedProjects[project.id]) {
      setActiveProjectId(project.id);
    } else {
      setPendingLockProject(project);
    }
  };

  const handleUnlockSuccess = () => {
    if (pendingLockProject) {
      setUnlockedProjects(prev => ({ ...prev, [pendingLockProject.id]: true }));
      setActiveProjectId(pendingLockProject.id);
      setPendingLockProject(null);
    }
  };

  const handleLockProject = (projectId: string) => {
    setUnlockedProjects(prev => ({ ...prev, [projectId]: false }));
  };

  // Create Project (Leader)
  const handleCreateProject = (newProjData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProj: Project = {
      ...newProjData,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updatedProjects = [newProj, ...projects];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    
    // Auto-unlock project created by current leader
    setUnlockedProjects(prev => ({ ...prev, [newProj.id]: true }));
    setActiveProjectId(newProj.id);

    broadcastSync({
      type: 'PROJECT_CREATED',
      projectId: newProj.id,
      projectName: newProj.name
    });
  };

  // Add Task (Leader)
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    // Log & Broadcast
    const newLog = addLog({
      projectId: newTask.projectId,
      userName,
      userRole,
      action: 'agregó nuevo objetivo',
      taskTitle: newTask.title
    });
    setLogs(getLogs());

    broadcastSync({
      type: 'TASK_CREATED',
      projectId: newTask.projectId,
      taskTitle: newTask.title,
      userName
    });
  };

  // Toggle Task Completion (100%)
  const handleToggleTask = (taskId: string, completed: boolean, note?: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed,
          completedBy: completed ? userName : null,
          completedAt: completed ? new Date().toISOString() : null,
          note: note !== undefined ? note : t.note
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      const actionText = completed ? 'completó al 100%' : 'marcó como pendiente';
      addLog({
        projectId: targetTask.projectId,
        userName,
        userRole,
        action: actionText,
        taskTitle: targetTask.title
      });
      setLogs(getLogs());

      broadcastSync({
        type: 'TASK_UPDATED',
        projectId: targetTask.projectId,
        taskTitle: targetTask.title,
        completed,
        userName
      });
    }
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    if (targetTask) {
      addLog({
        projectId: targetTask.projectId,
        userName,
        userRole,
        action: 'eliminó la tarea',
        taskTitle: targetTask.title
      });
      setLogs(getLogs());

      broadcastSync({
        type: 'TASK_DELETED',
        projectId: targetTask.projectId,
        taskTitle: targetTask.title,
        userName
      });
    }
  };

  // Handle Master PIN change
  const handleSaveMasterPin = () => {
    if (newMasterPinInput.length === 4) {
      setMasterPin(newMasterPinInput);
      setIsChangingMasterPin(false);
      setNewMasterPinInput('');
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeTasks = tasks.filter(t => t.projectId === activeProjectId);
  const activeLogs = logs.filter(l => l.projectId === activeProjectId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-12">
      
      {/* Top Navbar */}
      <Navbar
        userRole={userRole}
        userName={userName}
        onRoleChange={(role) => {
          setUserRole(role);
          if (role === 'leader' && userName.includes('Colaborador')) {
            setUserName('Jefe de Proyecto');
          }
        }}
        onUserNameChange={setUserName}
        onOpenMasterPin={() => setIsChangingMasterPin(true)}
        deferredInstallPrompt={deferredInstallPrompt}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1 w-full space-y-8">
        
        {/* PWA Install Banner */}
        <InstallPwaBanner
          deferredPrompt={deferredInstallPrompt}
          onInstall={handleInstallPwa}
        />

        {/* Project Selector Grid */}
        <ProjectSelector
          projects={projects}
          allTasks={tasks}
          activeProjectId={activeProjectId}
          unlockedProjects={unlockedProjects}
          userRole={userRole}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
        />

        {/* Active Project Workspace */}
        {activeProject && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-4 border-t border-slate-800/80">
            
            {/* Task Board (2 columns wide on desktop) */}
            <div className="lg:col-span-2">
              <TaskBoard
                project={activeProject}
                tasks={activeTasks}
                userRole={userRole}
                userName={userName}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onLockProject={() => handleLockProject(activeProject.id)}
              />
            </div>

            {/* Realtime Activity Stream (1 column wide on desktop) */}
            <div className="lg:col-span-1 space-y-6">
              <ActivityFeed logs={activeLogs} />
            </div>

          </div>
        )}

      </main>

      {/* Security Pin Lock Modal */}
      {pendingLockProject && (
        <PinLockModal
          isOpen={!!pendingLockProject}
          targetName={pendingLockProject.name}
          expectedPin={pendingLockProject.pin}
          allowBiometrics={pendingLockProject.biometricRequired}
          onSuccess={handleUnlockSuccess}
          onClose={() => setPendingLockProject(null)}
        />
      )}

      {/* Change Master PIN Modal */}
      {isChangingMasterPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <KeyRound className="w-5 h-5" />
              <span>Configuración de PIN de Acceso</span>
            </div>
            <p className="text-xs text-slate-400">
              Establece la contraseña por defecto de 4 dígitos para proteger tus proyectos.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nuevo PIN (4 dígitos)</label>
              <input
                type="text"
                maxLength={4}
                placeholder="1234"
                value={newMasterPinInput}
                onChange={(e) => setNewMasterPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono tracking-widest text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsChangingMasterPin(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMasterPin}
                disabled={newMasterPinInput.length !== 4}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-lg hover:bg-indigo-500 disabled:opacity-50"
              >
                Guardar PIN
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
