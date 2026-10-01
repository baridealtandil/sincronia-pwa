import React from 'react';
import { User, Bell } from 'lucide-react';
import { UserSession } from '../types';

interface HeaderNavbarProps {
  userSession: UserSession;
  onOpenLogin: () => void;
  myUnreadCount?: number;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  userSession,
  onOpenLogin,
  myUnreadCount = 0
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-2xl border-b border-indigo-500/20 sticky top-0 z-40 shadow-xl shadow-slate-950/60 w-full overflow-hidden pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 w-full my-auto">
        
        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <img 
            src="/logo.jpg" 
            alt="Synchro Logo" 
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover ring-2 ring-cyan-500/40 shadow-md shadow-cyan-500/20" 
          />
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-base sm:text-lg text-white tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Synchro
            </h1>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hidden xs:inline-block">
              PRO
            </span>
          </div>
        </div>

        {/* User Info & Personal Notifications Badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 min-w-0">
          
          {/* Notification Counter Badge (If user has pending tasks assigned) */}
          {myUnreadCount > 0 && (
            <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold flex items-center gap-1 animate-pulse-glow">
              <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>{myUnreadCount} {myUnreadCount === 1 ? 'tarea tuya' : 'tareas tuyas'}</span>
            </div>
          )}

          {/* User Name Badge */}
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/50 transition-all text-xs text-slate-200 shadow-sm"
            title="Cambiar Nombre y Apellido"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white text-[10px] flex-shrink-0">
              {userSession.firstName ? userSession.firstName.charAt(0) : 'U'}{userSession.lastName ? userSession.lastName.charAt(0) : ''}
            </div>
            <span className="font-bold text-slate-100 max-w-[95px] sm:max-w-[130px] truncate text-[11px] sm:text-xs">
              {userSession.fullName || 'Ingresar'}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
};
