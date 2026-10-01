import React from 'react';
import { Folder, ListTodo, Users, LayoutDashboard } from 'lucide-react';
import { Project } from '../types';

interface NavigationProps {
  step: 'step1_project' | 'step2_tasks' | 'step3_assign' | 'step4_dashboard';
  setStep: (step: 'step1_project' | 'step2_tasks' | 'step3_assign' | 'step4_dashboard') => void;
  activeProject: Project | null;
  hasTasks: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  step,
  setStep,
  activeProject,
  hasTasks
}) => {
  const steps = [
    {
      id: 'step1_project' as const,
      label: 'Proyecto',
      icon: Folder,
      disabled: false,
    },
    {
      id: 'step2_tasks' as const,
      label: 'Tareas',
      icon: ListTodo,
      disabled: !activeProject,
    },
    {
      id: 'step3_assign' as const,
      label: 'Equipo',
      icon: Users,
      disabled: !activeProject || !hasTasks,
    },
    {
      id: 'step4_dashboard' as const,
      label: 'Tablero',
      icon: LayoutDashboard,
      disabled: !activeProject,
    },
  ];

  return (
    <>
      {/* 💻 Desktop / Tablet Top Segmented Control Navigation */}
      <div className="hidden sm:flex items-center justify-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl max-w-xl mx-auto w-full">
        {steps.map((item, index) => {
          const Icon = item.icon;
          const isActive = step === item.id;

          return (
            <React.Fragment key={item.id}>
              {index > 0 && <div className="w-px h-4 bg-slate-800 mx-1" />}
              <button
                onClick={() => setStep(item.id)}
                disabled={item.disabled}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-cyan-500/20'
                    : item.disabled
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* 📱 Mobile Fixed Bottom Dock / Tab Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/90 shadow-2xl shadow-black pb-safe max-w-full overflow-hidden">
        <div className="flex items-center justify-around h-14 px-2 max-w-md mx-auto">
          {steps.map((item) => {
            const Icon = item.icon;
            const isActive = step === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setStep(item.id)}
                disabled={item.disabled}
                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
                  isActive
                    ? 'text-cyan-400 font-extrabold'
                    : item.disabled
                    ? 'text-slate-700 cursor-not-allowed'
                    : 'text-slate-400 active:scale-95'
                }`}
              >
                {/* Glow pill indicator */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full shadow-lg shadow-cyan-400/50" />
                )}
                
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-cyan-400 scale-110' : 'text-slate-400'}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
