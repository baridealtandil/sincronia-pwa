import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProjectSelector } from './components/ProjectSelector';
import { TaskBoard } from './components/TaskBoard';
import { ActivityFeed } from './components/ActivityFeed';
import { PinLockModal } from './components/PinLockModal';
import { TeamModal } from './components/TeamModal';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { Project, Task, SubTask, TeamMember, ActivityLog, UserRole } from './types';
import { 
  getProjects, saveProjects, 
  getTasks, saveTasks, 
  getTeamMembers, saveTeamMembers,
  getLogs, addLog, 
  getMasterPin, setMasterPin 
} from './services/storage';
import { broadcastSync, subscribeToSync } from './services/realtime';
import { KeyRound } from 'lucide-react';

export const App: React.FC = () => {
  // Application Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Active Context & Role
  const [userRole, setUserRole] = useState<UserRole>('manager');
  const [userName, setUserName] = useState<string>('Martín G. (Encargado)');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Security Lock State
  const [unlockedProjects, setUnlockedProjects] = useState<Record<string, boolean>>({});
  const [pendingLockProject, setPendingLockProject] = useState<Project | null>(null);
  
  // Modals
  const [isChangingMasterPin, setIsChangingMasterPin] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [newMasterPinInput, setNewMasterPinInput] = useState('');

  // PWA Install Prompt
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  // Load Initial Data
  useEffect(() => {
    const loadedProjects = getProjects();
    const loadedTasks = getTasks();
    const loadedMembers = getTeamMembers();
    const loadedLogs = getLogs();

    setProjects(loadedProjects);
    setTasks(loadedTasks);
    setTeamMembers(loadedMembers);
    setLogs(loadedLogs);

    if (loadedProjects.length > 0) {
      setActiveProjectId(loadedProjects[0].id);
    }
  }, []);

  // Listen for Realtime Sync events from other tabs or devices
  useEffect(() => {
    const unsubscribe = subscribeToSync(() => {
      setProjects(getProjects());
      setTasks(getTasks());
      setTeamMembers(getTeamMembers());
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

  // Select project handler
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
    
    setUnlockedProjects(prev => ({ ...prev, [newProj.id]: true }));
    setActiveProjectId(newProj.id);

    broadcastSync({
      type: 'PROJECT_CREATED',
      projectId: newProj.id,
      projectName: newProj.name
    });
  };

  // Add Member / Subcollaborator
  const handleAddMember = (name: string, role: UserRole) => {
    if (!activeProjectId) return;
    const newMember: TeamMember = {
      id: 'mem-' + Date.now(),
      projectId: activeProjectId,
      name,
      role,
      invitedBy: userName,
      createdAt: new Date().toISOString()
    };
    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    saveTeamMembers(updated);

    addLog({
      projectId: activeProjectId,
      userName,
      userRole,
      action: `agregó al equipo a ${name}`,
      taskTitle: role === 'subcollaborator' ? 'Sub-colaborador' : 'Encargado'
    });
    setLogs(getLogs());
  };

  // Add Task (Leader)
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
      subtasks: []
    };
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    addLog({
      projectId: newTask.projectId,
      userName,
      userRole,
      action: 'creó nuevo objetivo principal',
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

  // Add SubTask (Leader / Encargado)
  const handleAddSubTask = (parentTaskId: string, title: string, assignedTo: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === parentTaskId) {
        const newSub: SubTask = {
          id: 'sub-' + Date.now(),
          parentTaskId,
          title,
          assignedTo,
          completed: false,
          completedBy: null,
          completedAt: null,
          createdAt: new Date().toISOString()
        };
        return {
          ...t,
          subtasks: [...(t.subtasks || []), newSub]
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    const parent = tasks.find(t => t.id === parentTaskId);
    if (parent && activeProjectId) {
      addLog({
        projectId: activeProjectId,
        userName,
        userRole,
        action: `delegó sub-tarea a ${assignedTo}`,
        taskTitle: title
      });
      setLogs(getLogs());

      broadcastSync({
        type: 'TASK_CREATED',
        projectId: activeProjectId,
        taskTitle: `${title} (Delegada)`,
        userName
      });
    }
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

  // Toggle SubTask Completion (100%)
  const handleToggleSubTask = (parentTaskId: string, subTaskId: string, completed: boolean) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === parentTaskId) {
        const updatedSubs = (t.subtasks || []).map(s => {
          if (s.id === subTaskId) {
            return {
              ...s,
              completed,
              completedBy: completed ? userName : null,
              completedAt: completed ? new Date().toISOString() : null
            };
          }
          return s;
        });

        // Check if all subtasks are complete
        const allSubsComplete = updatedSubs.length > 0 && updatedSubs.every(s => s.completed);

        return {
          ...t,
          subtasks: updatedSubs,
          // Auto-mark parent complete if all subtasks completed
          completed: allSubsComplete ? true : t.completed,
          completedBy: allSubsComplete ? (t.completedBy || userName) : t.completedBy,
          completedAt: allSubsComplete ? (t.completedAt || new Date().toISOString()) : t.completedAt
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    const parent = tasks.find(t => t.id === parentTaskId);
    const targetSub = parent?.subtasks?.find(s => s.id === subTaskId);
    if (parent && targetSub) {
      addLog({
        projectId: parent.projectId,
        userName,
        userRole,
        action: completed ? 'completó sub-tarea al 100%' : 'reabrió sub-tarea',
        taskTitle: targetSub.title
      });
      setLogs(getLogs());

      broadcastSync({
        type: 'TASK_UPDATED',
        projectId: parent.projectId,
        taskTitle: targetSub.title,
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
    }
  };

  const handleSaveMasterPin = () => {
    if (newMasterPinInput.length === 4) {
      setMasterPin(newMasterPinInput);
      setIsChangingMasterPin(false);
      setNewMasterPinInput('');
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeTasks = tasks.filter(t => t.projectId === activeProjectId);
  const activeMembers = teamMembers.filter(m => m.projectId === activeProjectId);
  const activeLogs = logs.filter(l => l.projectId === activeProjectId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-12">
      
      {/* Top Navbar */}
      <Navbar
        userRole={userRole}
        userName={userName}
        onRoleChange={(role) => {
          setUserRole(role);
          if (role === 'leader') setUserName('Carlos V. (Jefe)');
          else if (role === 'manager') setUserName('Martín G. (Encargado)');
          else setUserName('Esteban K. (Sub-colaborador)');
        }}
        onUserNameChange={setUserName}
        onOpenMasterPin={() => setIsChangingMasterPin(true)}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
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
            
            {/* Task Board */}
            <div className="lg:col-span-2">
              <TaskBoard
                project={activeProject}
                tasks={activeTasks}
                teamMembers={activeMembers}
                userRole={userRole}
                userName={userName}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onAddSubTask={handleAddSubTask}
                onToggleSubTask={handleToggleSubTask}
                onDeleteTask={handleDeleteTask}
                onLockProject={() => handleLockProject(activeProject.id)}
                onOpenTeamModal={() => setIsTeamModalOpen(true)}
              />
            </div>

            {/* Realtime Activity Stream */}
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

      {/* Team Management Modal */}
      {activeProject && (
        <TeamModal
          isOpen={isTeamModalOpen}
          projectId={activeProject.id}
          projectName={activeProject.name}
          currentUserRole={userRole}
          currentUserName={userName}
          members={activeMembers}
          onAddMember={handleAddMember}
          onClose={() => setIsTeamModalOpen(false)}
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
