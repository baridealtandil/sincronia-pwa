import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Circle, Plus, Shield, Lock, 
  Trash2, MessageSquare, Sparkles, UserCheck, 
  CornerDownRight, Users, ChevronDown, ChevronRight, UserPlus
} from 'lucide-react';
import { Project, Task, SubTask, TeamMember, UserRole, Priority } from '../types';

interface TaskBoardProps {
  project: Project;
  tasks: Task[];
  teamMembers: TeamMember[];
  userRole: UserRole;
  userName: string;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onToggleTask: (taskId: string, completed: boolean, note?: string) => void;
  onAddSubTask: (parentTaskId: string, title: string, assignedTo: string) => void;
  onToggleSubTask: (parentTaskId: string, subTaskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onLockProject: () => void;
  onOpenTeamModal: () => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  project,
  tasks,
  teamMembers,
  userRole,
  userName,
  onAddTask,
  onToggleTask,
  onAddSubTask,
  onToggleSubTask,
  onDeleteTask,
  onLockProject,
  onOpenTeamModal
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  // New Parent Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('media');

  // Sub-task Inline Form State
  const [addingSubTaskForId, setAddingSubTaskForId] = useState<string | null>(null);
  const [subTaskTitle, setSubTaskTitle] = useState('');
  const [subTaskAssignee, setSubTaskAssignee] = useState('');

  // Expanded subtasks collapsible state
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  // Task note modal state
  const [noteModalTask, setNoteModalTask] = useState<Task | null>(null);
  const [taskNoteText, setTaskNoteText] = useState('');

  const managersList = teamMembers.filter(m => m.role === 'manager' || m.role === 'leader');
  const subcollabsList = teamMembers.filter(m => m.role === 'subcollaborator');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      projectId: project.id,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      assignedTo: newAssignee.trim() || (managersList[0]?.name || userName),
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

  const handleCreateSubTask = (parentTaskId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!subTaskTitle.trim()) return;

    onAddSubTask(
      parentTaskId,
      subTaskTitle.trim(),
      subTaskAssignee.trim() || (subcollabsList[0]?.name || 'Sub-colaborador')
    );

    setSubTaskTitle('');
    setSubTaskAssignee('');
    setAddingSubTaskForId(null);
    setExpandedTasks(prev => ({ ...prev, [parentTaskId]: true }));
  };

  const handleCheckTask = (task: Task) => {
    const nextCompletedState = !task.completed;

    if (nextCompletedState) {
      try {
        confetti({
          particleCount: 80,
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

  const handleCheckSubTask = (parentTaskId: string, subTask: SubTask) => {
    const nextCompleted = !subTask.completed;
    if (nextCompleted) {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#38bdf8', '#34d399']
        });
      } catch (e) {
        console.log(e);
      }
    }
    onToggleSubTask(parentTaskId, subTask.id, nextCompleted);
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
        
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{project.name}</h2>
              <button
                onClick={onLockProject}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>PIN {project.pin}</span>
              </button>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">{project.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTeamModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs hover:border-indigo-500/50 hover:text-indigo-300 transition-all"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Gestionar Equipo</span>
            </button>

            {userRole === 'leader' && (
              <button
                onClick={() => setIsAddingTask(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Objetivo</span>
              </button>
            )}
          </div>
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
            <span>{completedCount} de {totalCount} objetivos principales finalizados</span>
            <span>{totalCount - completedCount} objetivos pendientes</span>
          </div>
        </div>

      </div>

      {/* Filter Tabs & Active Role Banner */}
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

        <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Modo interactivo: <strong className="text-slate-200">{userName}</strong> ({
            userRole === 'leader' ? '👑 Jefe de Proyecto' : userRole === 'manager' ? '👔 Encargado' : '👷 Sub-colaborador'
          })</span>
        </div>
      </div>

      {/* Form modal to add parent objective */}
      {isAddingTask && (
        <form onSubmit={handleCreateTask} className="rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Crear Nuevo Objetivo Principal (Jefe de Proyecto)
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Asignar A Encargado Principal</label>
              <input
                type="text"
                placeholder="Ej. Martín G. (Encargado)"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción / Instrucciones</label>
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
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-lg hover:bg-indigo-500"
            >
              Guardar Objetivo
            </button>
          </div>
        </form>
      )}

      {/* Hierarchical Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="rounded-3xl bg-slate-900/40 border border-slate-800/80 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">No hay tareas en esta vista</h4>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const subtasks = task.subtasks || [];
            const subCompleted = subtasks.filter(s => s.completed).length;
            const subTotal = subtasks.length;
            const isExpanded = expandedTasks[task.id] !== false; // expanded by default

            return (
              <div
                key={task.id}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  task.completed
                    ? 'bg-slate-950/60 border-emerald-950/50'
                    : 'bg-slate-900/90 border-slate-800 shadow-lg'
                }`}
              >
                
                {/* Parent Task Header Row */}
                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    
                    {/* Parent Checkbox (100% completed) */}
                    <button
                      onClick={() => handleCheckTask(task)}
                      className="mt-0.5 flex-shrink-0 transition-transform active:scale-90"
                      title={task.completed ? 'Marcar como pendiente' : 'Tildar como 100% terminada por el Encargado'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500 hover:text-indigo-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className={`text-base font-bold tracking-tight ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {task.title}
                        </h4>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          task.priority === 'alta'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : task.priority === 'media'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {task.priority}
                        </span>

                        {subTotal > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                            <span>Sub-tareas: {subCompleted}/{subTotal}</span>
                          </span>
                        )}

                        {task.completed && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            100% Terminada
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className={`text-xs mb-2 ${task.completed ? 'text-slate-600' : 'text-slate-400'}`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                        <span>Encargado: <strong className="text-slate-300">{task.assignedTo}</strong></span>
                        {task.completedBy && <span className="text-emerald-400">✓ Completada por {task.completedBy}</span>}
                      </div>

                    </div>

                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    
                    {/* Delegate Sub-task Button (Leader or Encargado) */}
                    {(userRole === 'leader' || userRole === 'manager') && (
                      <button
                        onClick={() => {
                          setAddingSubTaskForId(task.id);
                          setExpandedTasks(prev => ({ ...prev, [task.id]: true }));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 text-xs font-semibold flex items-center gap-1.5"
                        title="Delegar sub-tarea a un Sub-colaborador"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Delegar Sub-tarea</span>
                      </button>
                    )}

                    {/* Expand / Collapse Subtasks */}
                    {subTotal > 0 && (
                      <button
                        onClick={() => toggleExpand(task.id)}
                        className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    )}

                    {userRole === 'leader' && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-red-400"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                  </div>

                </div>

                {/* Sub-task Inline Addition Form */}
                {addingSubTaskForId === task.id && (
                  <form
                    onSubmit={(e) => handleCreateSubTask(task.id, e)}
                    className="mx-5 mb-4 p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <CornerDownRight className="w-4 h-4 text-indigo-400" />
                        Delegar Sub-tarea a Sub-colaborador
                      </span>
                      <button
                        type="button"
                        onClick={() => setAddingSubTaskForId(null)}
                        className="text-xs text-slate-500 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Nombre de la sub-tarea..."
                          value={subTaskTitle}
                          onChange={(e) => setSubTaskTitle(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Asignar a Sub-colaborador (ej. Esteban K.)"
                          value={subTaskAssignee}
                          onChange={(e) => setSubTaskAssignee(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500"
                      >
                        Asignar Sub-tarea
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub-tasks Nested List */}
                {isExpanded && subtasks.length > 0 && (
                  <div className="bg-slate-950/70 border-t border-slate-800/80 p-4 space-y-2 pl-6 sm:pl-10">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Sub-tareas Delegadas ({subCompleted}/{subTotal} completadas):
                    </span>

                    {subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-xs ${
                          sub.completed
                            ? 'bg-slate-900/40 border-emerald-950/40 text-slate-400'
                            : 'bg-slate-900 border-slate-800/90 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCheckSubTask(task.id, sub)}
                            className="transition-transform active:scale-90"
                            title={sub.completed ? 'Marcar como pendiente' : 'Tildar sub-tarea al 100%'}
                          >
                            {sub.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500 hover:text-cyan-400" />
                            )}
                          </button>

                          <div>
                            <span className={`font-semibold ${sub.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                              {sub.title}
                            </span>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>Delegado a: <strong className="text-cyan-400">{sub.assignedTo}</strong></span>
                              {sub.completedBy && <span className="text-emerald-400 font-medium">✓ Completado por {sub.completedBy}</span>}
                            </div>
                          </div>
                        </div>

                        {sub.completed && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            100% Lista
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
