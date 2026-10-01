import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Eye, Plus, FolderPlus, Clock, 
  Users, Sparkles, UserCheck, ArrowRightLeft, Bell, X
} from 'lucide-react';
import { Project, Task, AppNotification } from '../types';
import { isTaskAssignedToUser } from '../utils/taskParser';

interface WizardStep4Props {
  project: Project;
  tasks: Task[];
  notifications: AppNotification[];
  userName: string;
  userFirstName?: string;
  collaborators?: string[];
  onConfirmReadTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onReassignTask: (taskId: string, newAssignee: string) => void;
  onNewProjectClick: () => void;
  onAddMoreTasksClick: () => void;
}

export const WizardStep4Dashboard: React.FC<WizardStep4Props> = ({
  project,
  tasks = [],
  notifications = [],
  userName = 'Usuario',
  userFirstName,
  collaborators = [],
  onConfirmReadTask,
  onCompleteTask,
  onReassignTask,
  onNewProjectClick,
  onAddMoreTasksClick
}) => {
  const safeUserName = userName || 'Usuario';
  const safeFirstName = userFirstName || safeUserName.split(' ')[0] || 'Usuario';
  const [filterPerson, setFilterPerson] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'completed'>('all');
  const [dismissedNotifId, setDismissedNotifId] = useState<string | null>(null);

  // Reassignment Modal State (Multi-Assignee Support)
  const [reassigningTaskId, setReassigningTaskId] = useState<string | null>(null);
  const [selectedNewAssignees, setSelectedNewAssignees] = useState<string[]>([]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completado');
  const readTasks = tasks.filter(t => t.status === 'leido' || t.status === 'completado');
  const unreadTasks = tasks.filter(t => t.status === 'pendiente');

  // User-specific task detection (matches if user is any of the assignees)
  const isMyTask = (t: Task) => isTaskAssignedToUser(t.assignedTo, safeUserName, safeFirstName);
  const myAssignedTasks = tasks.filter(isMyTask);
  const myUnreadTasks = myAssignedTasks.filter(t => t.status === 'pendiente');

  const completedCount = completedTasks.length;

  const PURGED_MOCK_NAMES = [
    'Sofía Gómez', 'Sofía Ruiz', 'Mateo Rodríguez', 
    'Lucas Fernández', 'Valentina Ruiz', 
    'Colaborador 1', 'Colaborador 2', 'Colaborador 3'
  ];

  // Extract all individual assignees even if a task has multiple comma-separated names
  const allAssignedNames = tasks.flatMap(t => 
    t.assignedTo ? t.assignedTo.split(',').map(s => s.trim()) : []
  ).filter(name => name && !PURGED_MOCK_NAMES.includes(name));

  const uniqueAssignees = Array.from(new Set(allAssignedNames));

  const defaultTeamList = Array.from(new Set([
    ...(safeUserName && safeUserName !== 'Usuario' ? [safeUserName] : []),
    ...(collaborators || []),
    ...uniqueAssignees
  ])).filter(name => name && name !== 'Usuario' && !PURGED_MOCK_NAMES.includes(name));

  const handleRead = (taskId: string) => {
    onConfirmReadTask(taskId);
  };

  const handleComplete = (taskId: string) => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#34d399', '#a855f7']
      });
    } catch (e) {
      console.log(e);
    }
    onCompleteTask(taskId);
  };

  const startReassigning = (task: Task) => {
    setReassigningTaskId(task.id);
    const existing = task.assignedTo ? task.assignedTo.split(',').map(s => s.trim()).filter(Boolean) : [];
    setSelectedNewAssignees(existing);
  };

  const toggleReassignee = (name: string) => {
    setSelectedNewAssignees(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleConfirmReassign = (taskId: string) => {
    if (selectedNewAssignees.length > 0) {
      const newAssigneesStr = selectedNewAssignees.join(', ');
      onReassignTask(taskId, newAssigneesStr);
      setReassigningTaskId(null);
      setSelectedNewAssignees([]);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterPerson === 'my_tasks') {
      if (!isMyTask(t)) return false;
    } else if (filterPerson !== 'all') {
      if (!isTaskAssignedToUser(t.assignedTo, filterPerson, filterPerson.split(' ')[0])) return false;
    }
    if (filterStatus === 'unread') return t.status === 'pendiente';
    if (filterStatus === 'read') return t.status === 'leido';
    if (filterStatus === 'completed') return t.status === 'completado';
    return true;
  });

  const latestNotification = notifications.length > 0 ? notifications[0] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in w-full overflow-hidden">
      
      {/* 🔔 Personal Notification Alert for Logged-in User */}
      {myUnreadTasks.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-orange-950/90 border border-amber-500/40 shadow-2xl space-y-2.5 animate-pulse-glow w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-400 animate-bounce flex-shrink-0" />
              ¡Atención {safeFirstName}! Tienes {myUnreadTasks.length} {myUnreadTasks.length === 1 ? 'tarea asignada' : 'tareas asignadas'} sin leer:
            </span>
            <button
              onClick={() => setFilterPerson('my_tasks')}
              className="text-[11px] font-bold text-amber-300 hover:underline bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/40 self-start sm:self-auto"
            >
              Ver mis tareas →
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            {myUnreadTasks.map(t => (
              <div key={t.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs text-white">
                <span className="font-bold truncate max-w-[180px] sm:max-w-xs">{t.title}</span>
                <button
                  onClick={() => onConfirmReadTask(t.id)}
                  className="px-2.5 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 flex-shrink-0 active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Leído</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔔 Latest Global Activity Toast Banner */}
      {latestNotification && dismissedNotifId !== latestNotification.id && (
        <div className={`p-3.5 rounded-2xl border shadow-xl flex items-center justify-between gap-3 animate-fade-in w-full overflow-hidden ${
          latestNotification.type === 'completed'
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
            : latestNotification.type === 'reassigned'
            ? 'bg-cyan-950/90 border-cyan-500/40 text-cyan-200'
            : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {latestNotification.type === 'completed' ? '🎉' : latestNotification.type === 'reassigned' ? '🔄' : '👀'}
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-extrabold text-xs truncate">{latestNotification.title}</h5>
              <p className="text-[11px] text-slate-200 truncate">{latestNotification.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[9px] opacity-75 font-mono">En vivo</span>
            <button
              onClick={() => setDismissedNotifId(latestNotification.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Cerrar notificación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 📊 EXECUTIVE PROJECT CARD */}
      <div className="rounded-3xl bg-slate-900/90 border border-indigo-500/20 p-5 sm:p-7 shadow-2xl shadow-slate-950/80 space-y-5 backdrop-blur-xl w-full overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate max-w-full">{project.name}</h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 whitespace-nowrap">
                Tablero Colaborativo
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span>Creado por: <strong className="text-cyan-300 font-bold">{project.leaderName}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-semibold">{totalTasks} {totalTasks === 1 ? 'tarea' : 'tareas'} en total</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
            <button
              onClick={onAddMoreTasksClick}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agregar Tareas</span>
            </button>
            <button
              onClick={onNewProjectClick}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold text-xs flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Proyectos</span>
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          
          <div
            onClick={() => setFilterStatus(filterStatus === 'unread' ? 'all' : 'unread')}
            className={`cursor-pointer p-2.5 sm:p-3.5 rounded-2xl border transition-all text-center ${
              filterStatus === 'unread'
                ? 'bg-amber-500/10 border-amber-500/50 shadow-lg ring-1 ring-amber-500/30'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-amber-500/30'
            }`}
          >
            <span className="text-[10px] sm:text-xs font-bold text-amber-400 block truncate">Sin Leer</span>
            <span className="text-base sm:text-lg font-extrabold text-amber-400 font-mono block mt-0.5">{unreadTasks.length}</span>
          </div>

          <div
            onClick={() => setFilterStatus(filterStatus === 'read' ? 'all' : 'read')}
            className={`cursor-pointer p-2.5 sm:p-3.5 rounded-2xl border transition-all text-center ${
              filterStatus === 'read'
                ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg ring-1 ring-cyan-500/30'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-cyan-500/30'
            }`}
          >
            <span className="text-[10px] sm:text-xs font-bold text-cyan-300 block truncate">Leídas</span>
            <span className="text-base sm:text-lg font-extrabold text-cyan-300 font-mono block mt-0.5">{readTasks.length}</span>
          </div>

          <div
            onClick={() => setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed')}
            className={`cursor-pointer p-2.5 sm:p-3.5 rounded-2xl border transition-all text-center ${
              filterStatus === 'completed'
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg ring-1 ring-emerald-500/30'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-emerald-500/30'
            }`}
          >
            <span className="text-[10px] sm:text-xs font-bold text-emerald-400 block truncate">Completadas</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono block mt-0.5">{completedCount}</span>
          </div>

        </div>

      </div>

      {/* Filter by Person */}
      {uniqueAssignees.length > 0 && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 space-y-2.5 w-full overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Filtrar por Colaborador:
            </span>
            {filterPerson !== 'all' && (
              <button
                onClick={() => setFilterPerson('all')}
                className="text-[11px] text-cyan-400 hover:underline font-semibold"
              >
                Ver Todos
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full">
            <button
              onClick={() => setFilterPerson('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                filterPerson === 'all'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todos ({totalTasks})
            </button>

            {myAssignedTasks.length > 0 && (
              <button
                onClick={() => setFilterPerson('my_tasks')}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex-shrink-0 ${
                  filterPerson === 'my_tasks'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md ring-2 ring-amber-500/40'
                    : 'bg-amber-500/10 text-amber-300 hover:text-white border border-amber-500/30'
                }`}
              >
                🔔 Mis Tareas ({myAssignedTasks.length})
              </button>
            )}

            {uniqueAssignees.map(name => {
              const personTasks = tasks.filter(t => isTaskAssignedToUser(t.assignedTo, name, name.split(' ')[0]));
              const personCompleted = personTasks.filter(t => t.status === 'completado').length;
              return (
                <button
                  key={name}
                  onClick={() => setFilterPerson(name)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                    filterPerson === name
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  👤 {name} ({personCompleted}/{personTasks.length})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TASK CARDS GRID */}
      <div className="space-y-4 w-full">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400">No hay tareas en este filtro.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isRead = task.status === 'leido' || task.status === 'completado';
            const isCompleted = task.status === 'completado';
            const isReassigningThis = reassigningTaskId === task.id;
            const assignedToMe = isMyTask(task);
            const assigneesList = task.assignedTo ? task.assignedTo.split(',').map(s => s.trim()).filter(Boolean) : [];

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-6 rounded-3xl border transition-all space-y-3.5 shadow-xl w-full overflow-hidden ${
                  assignedToMe && !isCompleted
                    ? 'bg-slate-900/95 border-amber-500/40 shadow-amber-500/10 ring-1 ring-amber-500/20'
                    : isCompleted
                    ? 'bg-slate-950/70 border-emerald-950/60 text-slate-400'
                    : isRead
                    ? 'bg-slate-900/90 border-cyan-950/80 shadow-cyan-950/20'
                    : 'bg-slate-900/90 border-slate-800 shadow-slate-950/40'
                }`}
              >
                
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h4 className={`text-sm sm:text-base font-extrabold tracking-tight ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      {assignedToMe && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          📌 Tu Tarea
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-xs text-cyan-400 font-bold">Asignado a:</span>
                      <div className="flex flex-wrap gap-1">
                        {assigneesList.map((aName) => (
                          <span key={aName} className="text-xs font-bold px-2 py-0.5 rounded-lg bg-cyan-500/10 text-slate-100 border border-cyan-500/20">
                            👤 {aName}
                          </span>
                        ))}
                      </div>

                      {task.reassignedFrom && (
                        <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 ml-1">
                          🔄 Reasignada de {task.reassignedFrom}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        100% Lista
                      </span>
                    ) : isRead ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-cyan-400" />
                        Leído
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Sin Leer
                      </span>
                    )}
                  </div>
                </div>

                {/* Audit Details */}
                <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400" />
                      Estado de Lectura:
                    </span>
                    {task.readBy ? (
                      <span className="text-cyan-300 font-bold"> Confirmado por {task.readBy}</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">⚪ Pendiente</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Estado de Trabajo:
                    </span>
                    {task.completedBy ? (
                      <span className="text-emerald-400 font-bold"> 100% por {task.completedBy}</span>
                    ) : (
                      <span className="text-slate-500 font-medium">En ejecución</span>
                    )}
                  </div>
                </div>

                {/* Inline Task Reassignment Selector Form with Multi-Assignee Toggle */}
                {isReassigningThis && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3 animate-fade-in w-full overflow-hidden">
                    <div className="flex justify-between items-center text-xs font-bold text-cyan-300">
                      <span className="flex items-center gap-1">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                        Selecciona uno o más colaboradores responsables:
                      </span>
                      <button
                        onClick={() => setReassigningTaskId(null)}
                        className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full pt-1">
                      {defaultTeamList.map(name => {
                        const isChecked = selectedNewAssignees.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => toggleReassignee(name)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                              isChecked
                                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md ring-2 ring-cyan-500/40'
                                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                            }`}
                          >
                            <span>{isChecked ? '☑️' : '⏹️'}</span>
                            <span>👤 {name}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handleConfirmReassign(task.id)}
                      disabled={selectedNewAssignees.length === 0}
                      className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 mt-1"
                    >
                      Confirmar Asignación ({selectedNewAssignees.length})
                    </button>
                  </div>
                )}

                {/* 🔘 PERFECT RESPONSIVE ACTION BUTTONS */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 w-full">
                  
                  {/* Button 1: Reasignar (Disponible para el equipo) */}
                  {!isCompleted && !isReassigningThis && (
                    <button
                      onClick={() => startReassigning(task)}
                      className="flex-1 min-w-[90px] py-2 px-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                      title="Reasignar tarea"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>Reasignar</span>
                    </button>
                  )}

                  {/* Button 2: Confirmar Lectura (SOLO si la tarea está asignada al usuario actual) */}
                  {assignedToMe && !isRead && (
                    <button
                      onClick={() => handleRead(task.id)}
                      className="flex-1 min-w-[85px] py-2 px-2.5 rounded-xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                      title="Confirmar Lectura"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>Leído</span>
                    </button>
                  )}

                  {/* Button 3: Tildar 100% Terminada (SOLO si la tarea está asignada al usuario actual) */}
                  {assignedToMe && !isCompleted && (
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="flex-1 min-w-[95px] py-2 px-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-extrabold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md shadow-emerald-600/20"
                      title="Tildar 100% Terminada"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>100% Listo</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="ml-auto text-[11px] text-emerald-400 font-extrabold flex items-center gap-1 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>100% Finalizada</span>
                    </div>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
