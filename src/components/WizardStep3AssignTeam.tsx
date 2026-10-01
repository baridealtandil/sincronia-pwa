import React, { useState } from 'react';
import { Users, ArrowLeft, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';

interface WizardStep3Props {
  tasks: Task[];
  onAssignTask: (taskId: string, assigneeName: string) => void;
  onPrevStep: () => void;
  onFinishStep: () => void;
}

export const WizardStep3AssignTeam: React.FC<WizardStep3Props> = ({
  tasks,
  onAssignTask,
  onPrevStep,
  onFinishStep
}) => {
  const [collaborators, setCollaborators] = useState(['Sofía', 'Mateo', 'Lucas', 'Valentina']);
  const [newCollabInput, setNewCollabInput] = useState('');

  const handleAddCollab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabInput.trim()) return;
    if (!collaborators.includes(newCollabInput.trim())) {
      setCollaborators([...collaborators, newCollabInput.trim()]);
    }
    setNewCollabInput('');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      
      {/* Step Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Paso 3 de 3: Asignar Responsables
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">¿A quién le asignas cada tarea?</h2>
        <p className="text-xs text-slate-400">Selecciona el colaborador a cargo para cada tarea de la lista.</p>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
        
        {/* Add Collaborator Quick Form */}
        <form onSubmit={handleAddCollab} className="flex gap-2 pb-4 border-b border-slate-800">
          <input
            type="text"
            placeholder="Agregar nombre de colaborador (ej. Lucía)..."
            value={newCollabInput}
            onChange={(e) => setNewCollabInput(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md whitespace-nowrap"
          >
            + Agregar Persona
          </button>
        </form>

        {/* Task Assignment List */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span className="font-semibold text-slate-100 text-sm">{task.title}</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-[11px] text-slate-400">Asignar a:</span>
                <select
                  value={task.assignedTo}
                  onChange={(e) => onAssignTask(task.id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-indigo-300 font-bold outline-none focus:border-indigo-500"
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
            className="px-4 py-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Atrás</span>
          </button>

          <button
            onClick={onFinishStep}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30"
          >
            <span>Ir al Tablero del Proyecto</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
