import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Circle, Plus, Shield, Lock, Fingerprint, 
  Trash2, MessageSquare, AlertTriangle, Sparkles, Filter, 
  Clock, UserCheck, Flame
} from 'lucide-react';
import { Project, Task, UserRole, Priority } from '../types';

interface TaskBoardProps {
  project: Project;
  tasks: Task[];
  userRole: UserRole;
  userName: string;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onToggleTask: (taskId: string, completed: boolean, note?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onLockProject: () => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  project,
  tasks,
  userRole,
  userName,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onLockProject
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('media');

  // Task note modal state
  const [noteModalTask, setNoteModalTask] = useState<Task | null>(null);
  const [taskNoteText, setTaskNoteText] = useState('');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      projectId: project.id,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      assignedTo: newAssignee.trim() || userName,
      priority: newPriority,
      completed: false,
      completedBy: null,
      completedAt: null
    });

    setNewTitle('');
    setNewDescription('');
    setNewAssignee('');
    setIsAddingTask(false);
  };

  const handleCheckTask = (task: Task) => {
    const nextCompletedState = !task.completed;

    if (nextCompletedState) {
      // Trigger celebration confetti on task 100% completion
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#38bdf8', '#a855f7', '#34d399']
        });
      } catch (e) {
        console.log(e);
      }
    }

    onToggleTask(task.id, nextCompletedState);
  };

  const handleSaveNote = () => {
    if (noteModalTask) {
      onToggleTask(noteModalTask.id, noteModalTask.completed, taskNoteText);
      setNoteModalTask(null);
      setTaskNoteText('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Project Header Card */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        
        {/* Glowing Background Accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{project.name}</h2>
              <button
                onClick={onLockProject}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-all"
                title="Re-bloquear este proyecto"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bloqueado (PIN {project.pin})</span>
              </button>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">{project.description}</p>
          </div>

          {/* Leader actions */}
          {userRole === 'leader' && (
            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Objetivo</span>
            </button>
          )}
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Progreso General del Proyecto
            </span>
            <span className="text-indigo-400 font-mono text-sm">{progressPercent}% Completado</span>
          </div>

          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-700 ease-out relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
            <span>{completedCount} de {totalCount} tareas finalizadas 100%</span>
            <span>{totalCount - completedCount} tareas pendientes</span>
          </div>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas ({totalCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'pending'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pendientes ({totalCount - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completadas 100% ({completedCount})
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-800">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Modo interactivo activo como: <strong className="text-slate-200">{userName}</strong> ({userRole === 'leader' ? 'Líder' : 'Colaborador'})</span>
        </div>
      </div>

      {/* Add Task Form Modal / Inline */}
      {isAddingTask && (
        <form onSubmit={handleCreateTask} className="rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Agregar Nuevo Objetivo / Tarea al Proyecto
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Título del Objetivo *</label>
              <input
                type="text"
                placeholder="Ej. Tildar cuando las pruebas de QA estén al 100%"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Asignar A (Colaborador)</label>
              <input
                type="text"
                placeholder="Ej. Sofía L."
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridad</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="alta">🔴 Prioridad Alta</option>
                <option value="media">🟡 Prioridad Media</option>
                <option value="baja">🟢 Prioridad Baja</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Instrucciones o Descripción</label>
              <textarea
                placeholder="Detalles sobre lo que se requiere para considerar la tarea lista..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
            >
              Guardar Objetivo
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-3xl bg-slate-900/40 border border-slate-800/80 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">No hay tareas en esta vista</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {filter === 'completed' 
                ? 'Ninguna tarea ha sido marcada como completada aún.' 
                : 'El listado de objetivos está al día.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            return (
              <div
                key={task.id}
                className={`group rounded-2xl border p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  task.completed
                    ? 'bg-slate-950/60 border-emerald-950/50 hover:border-emerald-500/30 text-slate-400'
                    : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40 text-white shadow-md'
                }`}
              >
                
                {/* Left Section: Checkbox & Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  
                  {/* Interactive Checkbox (100% completed) */}
                  <button
                    onClick={() => handleCheckTask(task)}
                    className="mt-0.5 flex-shrink-0 transition-transform active:scale-90"
                    title={task.completed ? 'Marcar como pendiente' : 'Tildar como 100% terminada'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 transition-all duration-300" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 transition-all duration-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className={`text-base font-bold tracking-tight ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {task.title}
                      </h4>

                      {/* Priority Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        task.priority === 'alta'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : task.priority === 'media'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {task.priority}
                      </span>

                      {/* Completed 100% Badge */}
                      {task.completed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          100% Terminada
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className={`text-xs mb-2 ${task.completed ? 'text-slate-600' : 'text-slate-400'}`}>
                        {task.description}
                      </p>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                      <span>Asignado a: <strong className="text-slate-300">{task.assignedTo}</strong></span>

                      {task.completed && task.completedBy && (
                        <span className="text-emerald-400/90 font-medium">
                          ✓ Completada por {task.completedBy}
                        </span>
                      )}

                      {task.note && (
                        <button
                          onClick={() => {
                            setNoteModalTask(task);
                            setTaskNoteText(task.note || '');
                          }}
                          className="flex items-center gap-1 text-indigo-400 hover:underline"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Ver Nota</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  
                  {/* Add Note Button */}
                  <button
                    onClick={() => {
                      setNoteModalTask(task);
                      setTaskNoteText(task.note || '');
                    }}
                    className="p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-all text-xs flex items-center gap-1"
                    title="Agregar o editar nota de la tarea"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  {/* Delete Task Button (Leader or Admin) */}
                  {userRole === 'leader' && (
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                      title="Eliminar objetivo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Task Note Modal */}
      {noteModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Nota / Observación de Tarea</h3>
            <p className="text-xs text-slate-400 mb-4">{noteModalTask.title}</p>

            <textarea
              value={taskNoteText}
              onChange={(e) => setTaskNoteText(e.target.value)}
              placeholder="Escribe comentarios sobre cómo se resolvió esta tarea..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setNoteModalTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
              >
                Guardar Nota
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
