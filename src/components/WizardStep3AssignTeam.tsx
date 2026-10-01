import React, { useState } from 'react';
import { Users, ArrowLeft, ArrowRight, CheckCircle2, UserPlus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Task } from '../types';

interface WizardStep3Props {
  tasks: Task[];
  collaborators: string[];
  onAddCollaborator: (name: string) => void;
  onEditCollaborator: (oldName: string, newName: string) => void;
  onDeleteCollaborator: (name: string) => void;
  onAssignTask: (taskId: string, assigneeName: string) => void;
  onPrevStep: () => void;
  onFinishStep: () => void;
}

export const WizardStep3AssignTeam: React.FC<WizardStep3Props> = ({
  tasks,
  collaborators,
  onAddCollaborator,
  onEditCollaborator,
  onDeleteCollaborator,
  onAssignTask,
  onPrevStep,
  onFinishStep
}) => {
  const [newCollabInput, setNewCollabInput] = useState('');
  
  // Inline edit state
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempEditValue, setTempEditValue] = useState('');

  const handleAddCollab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabInput.trim()) return;
    onAddCollaborator(newCollabInput.trim());
    setNewCollabInput('');
  };

  const startEdit = (name: string) => {
    setEditingName(name);
    setTempEditValue(name);
  };

  const saveEdit = (oldName: string) => {
    if (tempEditValue.trim() && tempEditValue.trim() !== oldName) {
      onEditCollaborator(oldName, tempEditValue.trim());
    }
    setEditingName(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      
      {/* Card Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-wider uppercase text-cyan-400 bg-cyan-500/10 px-3.5 py-1 rounded-full border border-cyan-500/20">
          Paso 3: Asignar & Gestionar Equipo
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Colaboradores del Proyecto</h2>
        <p className="text-xs text-slate-400">Puedes agregar, editar o borrar nombres de colaboradores.</p>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Add Collaborator Form */}
        <form onSubmit={handleAddCollab} className="flex gap-2">
          <input
            type="text"
            placeholder="Nuevo nombre y apellido (ej. María Gómez)..."
            value={newCollabInput}
            onChange={(e) => setNewCollabInput(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md whitespace-nowrap flex items-center gap-1.5 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Agregar</span>
          </button>
        </form>

        {/* Manage Collaborators List Card */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300">Lista de Colaboradores ({collaborators.length}):</h4>
          
          <div className="flex flex-wrap gap-2">
            {collaborators.map((c) => (
              <div
                key={c}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                {editingName === c ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tempEditValue}
                      onChange={(e) => setTempEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(c)}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 text-xs text-white outline-none border border-cyan-500 w-28"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(c)} className="text-emerald-400 p-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingName(null)} className="text-slate-400 p-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold">👤 {c}</span>
                    <button
                      onClick={() => startEdit(c)}
                      className="text-slate-400 hover:text-cyan-400 p-1"
                      title="Editar nombre"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteCollaborator(c)}
                      className="text-slate-400 hover:text-red-400 p-1"
                      title="Borrar colaborador"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Task Cards Assignment */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 mb-2">Asignar Tarjetas de Tarea:</h4>
          
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span className="font-bold text-slate-100 text-sm">{task.title}</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-[11px] font-semibold text-slate-400">Asignado a:</span>
                <select
                  value={task.assignedTo}
                  onChange={(e) => onAssignTask(task.id, e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-bold outline-none focus:border-cyan-500"
                >
                  {collaborators.map((c) => (
                    <option key={c} value={c}>
                      👤 {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <button
            onClick={onPrevStep}
            className="px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Atrás</span>
          </button>

          <button
            onClick={onFinishStep}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-xl shadow-emerald-600/25 active:scale-95 transition-all"
          >
            <span>Ver Tablero Synchro</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
