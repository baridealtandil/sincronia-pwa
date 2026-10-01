import React from 'react';
import { User, LogOut } from 'lucide-react';
import { UserSession } from '../types';

interface HeaderNavbarProps {
  userSession: UserSession;
  onOpenLogin: () => void;
  onRoleChange: (role: 'leader' | 'collaborator') => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  userSession,
  onOpenLogin,
  onRoleChange
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-2xl border-b border-indigo-500/20 sticky top-0 z-40 shadow-xl shadow-slate-950/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo.jpg" 
            alt="Synchro Logo" 
            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20" 
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Synchro
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Sincronización de Tareas</p>
          </div>
        </div>

        {/* User Info & Role Tag */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* User Name Badge */}
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 transition-all text-xs text-slate-200"
            title="Cambiar Nombre y Apellido / Cambiar Usuario"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white text-[10px]">
              {userSession.firstName.charAt(0)}{userSession.lastName.charAt(0)}
            </div>
            <span className="font-extrabold text-slate-100 max-w-[120px] truncate">
              {userSession.fullName || 'Ingresar'}
            </span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => onRoleChange('leader')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                userSession.role === 'leader'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👑 Jefe
            </button>
            <button
              onClick={() => onRoleChange('collaborator')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                userSession.role === 'collaborator'
                  ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👷 Colaborador
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
