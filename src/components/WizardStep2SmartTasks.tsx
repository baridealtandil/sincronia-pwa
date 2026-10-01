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
  const [rawText, setRawText] = useState(
    "Diseñar el logotipo de la marca\nRedactar textos comerciales para la web\nConfigurar cuentas de redes sociales\nRealizar pruebas finales de calidad"
  );
  const [detectedList, setDetectedList] = useState<string[]>([]);

  // Automatically detect tasks whenever text changes
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
      
      {/* Step Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Paso 2 de 3: Tareas a Realizar
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Escribe las tareas del proyecto</h2>
        <p className="text-xs text-slate-400">
          Puedes escribir o pegar **varias tareas juntas** (una por línea). La herramienta las detectará automáticamente.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
        
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-300">Escribe las tareas (un texto por línea)</label>
            <span className="text-[11px] text-indigo-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Detección Automática
            </span>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={5}
            placeholder="Ejemplo:&#10;1. Diseñar el prototipo&#10;2. Aprobar presupuesto&#10;3. Publicar campaña"
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-mono"
          />
        </div>

        {/* Live Detected Task Cards */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Tareas Detectadas ({detectedList.length})</span>
            <span className="text-[10px] text-slate-500">Se crearán como tareas individuales</span>
          </h4>

          {detectedList.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Escribe arriba para ver las tareas detectadas.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {detectedList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="font-medium">{item}</span>
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
        <div className="flex justify-between items-center pt-3">
          <button
            onClick={onPrevStep}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Atrás</span>
          </button>

          <button
            onClick={handleConfirmTasks}
            disabled={detectedList.length === 0}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <span>Guardar Tareas y Asignar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
