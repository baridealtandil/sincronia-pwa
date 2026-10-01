import React from 'react';

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
    <header className="bg-slate-900/90 backdrop-blur-2xl border-b border-indigo-500/20 sticky top-0 z-40 shadow-xl shadow-slate-950/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand with New Synchro Logo */}
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
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Sincronización & Reasignación de Tareas</p>
          </div>
        </div>

        {/* User Role Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              onRoleChange('leader');
              if (userName.includes('Colaborador')) onUserNameChange('Líder del Proyecto');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              userRole === 'leader'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-indigo-500/30'
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
                ? 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white shadow-md shadow-cyan-500/30'
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
