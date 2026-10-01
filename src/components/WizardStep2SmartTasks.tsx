import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { Project } from '../types';
import { detectTasksFromText } from '../utils/taskParser';

interface WizardStep2Props {
  project: Project;
  onAddMultipleTasks: (taskTitles: string[]) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const WizardStep2SmartTasks: React.FC<WizardStep2Props> = ({
  project,
  onAddMultipleTasks,
  onPrevStep,
  onNextStep
}) => {
  const [rawText, setRawText] = useState('');
  const [detectedList, setDetectedList] = useState<string[]>([]);

  useEffect(() => {
    const tasks = detectTasksFromText(rawText);
    setDetectedList(tasks);
  }, [rawText]);

  const handleRemoveDetected = (index: number) => {
    setDetectedList(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmTasks = () => {
    if (detectedList.length > 0) {
      onAddMultipleTasks(detectedList);
      onNextStep();
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      
      {/* Card Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 px-3.5 py-1 rounded-full border border-indigo-500/20">
          Tarjeta 2: Escribir Tareas
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Carga las Tareas a Realizar</h2>
        <p className="text-xs text-slate-400">
          Escribe o pega tus tareas en el cuadro. La herramienta detectará automáticamente cada tarea.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-200">Escribe tus tareas (una por línea)</label>
            <span className="text-[11px] text-indigo-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Detección Inteligente
            </span>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={5}
            placeholder="Ejemplo:&#10;Diseñar el logotipo de la marca&#10;Redactar textos promocionales&#10;Configurar cuentas del equipo"
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-mono transition-colors"
          />
        </div>

        {/* Live Detected Task Cards */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-300">Tareas Detectadas ({detectedList.length})</h4>
            <span className="text-[10px] text-slate-500">Se convertirán en tarjetas de tarea</span>
          </div>

          {detectedList.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500">Escribe arriba para ver las tarjetas de tarea generadas en tiempo real.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {detectedList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-100">{item}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveDetected(idx)}
                    className="text-slate-500 hover:text-red-400 p-1"
                    title="Quitar esta tarea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <button
            onClick={onPrevStep}
            className="px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Atrás</span>
          </button>

          <button
            onClick={handleConfirmTasks}
            disabled={detectedList.length === 0}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-extrabold flex items-center gap-2 shadow-xl shadow-indigo-600/25 active:scale-95 transition-all"
          >
            <span>Guardar Tareas y Asignar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
