import React from 'react';
import { User, Sparkles } from 'lucide-react';

interface HeaderNavbarProps {
  userRole: 'leader' | 'collaborator';
  userName: string;
  onRoleChange: (role: 'leader' | 'collaborator') => void;
  onUserNameChange: (name: string) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  userRole,
  userName,
  onRoleChange,
  onUserNameChange
}) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-indigo-500/20">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-tight">Sincronía</h1>
            <p className="text-[10px] font-semibold text-slate-400">Gestión Profesional por Tarjetas</p>
          </div>
        </div>

        {/* Role Selector Card Badge */}
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              onRoleChange('leader');
              if (userName.includes('Colaborador')) onUserNameChange('Líder del Proyecto');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              userRole === 'leader'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👑 Modo Jefe
          </button>
          <button
            onClick={() => {
              onRoleChange('collaborator');
              if (userName.includes('Líder')) onUserNameChange('Colaborador');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              userRole === 'collaborator'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👷 Modo Colaborador
          </button>
        </div>

      </div>
    </header>
  );
};
