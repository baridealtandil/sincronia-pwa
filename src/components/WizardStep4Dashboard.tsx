import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Eye, Plus, FolderPlus, Clock, 
  Users, Sparkles, UserCheck, ArrowRightLeft
} from 'lucide-react';
import { Project, Task, AppNotification } from '../types';

interface WizardStep4Props {
  project: Project;
  tasks: Task[];
  notifications: AppNotification[];
  userRole: 'leader' | 'collaborator';
  userName: string;
  onConfirmReadTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onReassignTask: (taskId: string, newAssignee: string) => void;
  onNewProjectClick: () => void;
  onAddMoreTasksClick: () => void;
}

export const WizardStep4Dashboard: React.FC<WizardStep4Props> = ({
  project,
  tasks,
  notifications,
  userRole,
  userName,
  onConfirmReadTask,
  onCompleteTask,
  onReassignTask,
  onNewProjectClick,
  onAddMoreTasksClick
}) => {
  const [filterPerson, setFilterPerson] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'completed'>('all');

  // Reassignment Modal/Dropdown State
  const [reassigningTaskId, setReassigningTaskId] = useState<string | null>(null);
  const [selectedNewAssignee, setSelectedNewAssignee] = useState<string>('');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completado');
  const readTasks = tasks.filter(t => t.status === 'leido' || t.status === 'completado');
  const unreadTasks = tasks.filter(t => t.status === 'pendiente');

  const completedCount = completedTasks.length;
  const readCount = readTasks.length;
  const unreadCount = unreadTasks.length;
  const percent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignedTo)));
  const defaultTeamList = Array.from(new Set([...uniqueAssignees, 'Sofía Gómez', 'Mateo Rodríguez', 'Lucas Fernández', 'Valentina Ruiz']));

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

  const handleConfirmReassign = (taskId: string) => {
    if (selectedNewAssignee && selectedNewAssignee.trim()) {
      onReassignTask(taskId, selectedNewAssignee.trim());
      setReassigningTaskId(null);
      setSelectedNewAssignee('');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterPerson !== 'all' && t.assignedTo !== filterPerson) return false;
    if (filterStatus === 'unread') return t.status === 'pendiente';
    if (filterStatus === 'read') return t.status === 'leido';
    if (filterStatus === 'completed') return t.status === 'completado';
    return true;
  });

  const latestNotification = notifications.length > 0 ? notifications[0] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in w-full overflow-hidden">
      
      {/* 🔔 Latest Activity Toast Banner */}
      {latestNotification && (
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
          <span className="text-[9px] opacity-75 font-mono flex-shrink-0">En vivo</span>
        </div>
      )}

      {/* 📊 EXECUTIVE PROJECT CARD */}
      <div className="rounded-3xl bg-slate-900/90 border border-indigo-500/20 p-5 sm:p-7 shadow-2xl shadow-slate-950/80 space-y-5 backdrop-blur-xl w-full overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate max-w-full">{project.name}</h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 whitespace-nowrap">
                Tablero Synchro
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">Jefe del Proyecto: <strong className="text-slate-200">{project.leaderName}</strong></p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {userRole === 'leader' && (
              <>
                <button
                  onClick={onAddMoreTasksClick}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+ Tareas</span>
                </button>
                <button
                  onClick={onNewProjectClick}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Nuevo</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Progress Meter */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs font-extrabold">
            <span className="text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Avance Global
            </span>
            <span className="text-cyan-400 font-mono text-sm">{percent}%</span>
          </div>

          <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
          
          <div 
            onClick={() => setFilterStatus(filterStatus === 'unread' ? 'all' : 'unread')}
            className={`cursor-pointer p-2.5 sm:p-3.5 rounded-2xl border transition-all text-center ${
              filterStatus === 'unread'
                ? 'bg-amber-500/10 border-amber-500/50 shadow-lg ring-1 ring-amber-500/30'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-amber-500/30'
            }`}
          >
            <span className="text-[10px] sm:text-xs font-bold text-amber-400 block truncate">Sin Leer</span>
            <span className="text-base sm:text-lg font-extrabold text-amber-400 font-mono block mt-0.5">{unreadCount}</span>
          </div>

          <div 
            onClick={() => setFilterStatus(filterStatus === 'read' ? 'all' : 'read')}
            className={`cursor-pointer p-2.5 sm:p-3.5 rounded-2xl border transition-all text-center ${
              filterStatus === 'read'
                ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg ring-1 ring-cyan-500/30'
                : 'bg-slate-950/70 border-slate-800/80 hover:border-cyan-500/30'
            }`}
          >
            <span className="text-[10px] sm:text-xs font-bold text-cyan-300 block truncate">Leídos</span>
            <span className="text-base sm:text-lg font-extrabold text-cyan-300 font-mono block mt-0.5">{readCount}</span>
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

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
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

            {uniqueAssignees.map(name => {
              const personTasks = tasks.filter(t => t.assignedTo === name);
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

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-6 rounded-3xl border transition-all space-y-3.5 shadow-xl w-full overflow-hidden ${
                  isCompleted
                    ? 'bg-slate-950/70 border-emerald-950/60 text-slate-400'
                    : isRead
                    ? 'bg-slate-900/90 border-cyan-950/80 shadow-cyan-950/20'
                    : 'bg-slate-900/90 border-slate-800 shadow-slate-950/40'
                }`}
              >
                
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-sm sm:text-base font-extrabold tracking-tight ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-xs text-cyan-400 font-bold">
                        Asignado a: <span className="text-slate-100">{task.assignedTo}</span>
                      </p>

                      {task.reassignedFrom && (
                        <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
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

                {/* Inline Task Reassignment Selector Form */}
                {isReassigningThis && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-2.5 animate-fade-in">
                    <div className="flex justify-between items-center text-xs font-bold text-cyan-300">
                      <span className="flex items-center gap-1">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                        Reasignar a otro colaborador:
                      </span>
                      <button
                        onClick={() => setReassigningTaskId(null)}
                        className="text-slate-400 hover:text-white text-xs"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={selectedNewAssignee}
                        onChange={(e) => setSelectedNewAssignee(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold outline-none focus:border-cyan-500"
                      >
                        <option value="">Selecciona nuevo responsable...</option>
                        {defaultTeamList.filter(name => name !== task.assignedTo).map(name => (
                          <option key={name} value={name}>
                            👤 {name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleConfirmReassign(task.id)}
                        disabled={!selectedNewAssignee}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs shadow-md"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}

                {/* 🔘 COMPACT RESPONSIVE BUTTONS (Never overflow mobile screen!) */}
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-800/80 w-full">
                  
                  {/* Button 1: Reasignar (Compact pill) */}
                  {!isCompleted && !isReassigningThis && (
                    <button
                      onClick={() => {
                        setReassigningTaskId(task.id);
                        setSelectedNewAssignee('');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all flex-shrink-0"
                      title="Reasignar tarea"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Reasignar</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                    
                    {/* Button 2: Confirmar Lectura (Compact pill) */}
                    {!isRead && (
                      <button
                        onClick={() => handleRead(task.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all flex-shrink-0 shadow-sm"
                        title="Confirmar Lectura"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Leído</span>
                      </button>
                    )}

                    {/* Button 3: Tildar 100% Terminada (Compact pill) */}
                    {!isCompleted && (
                      <button
                        onClick={() => handleComplete(task.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all flex-shrink-0 shadow-md shadow-emerald-600/20"
                        title="Tildar 100% Terminada"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>100% Listo</span>
                      </button>
                    )}

                    {isCompleted && (
                      <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>100% Finalizada</span>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
