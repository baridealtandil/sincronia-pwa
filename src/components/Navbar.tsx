import React, { useState } from 'react';
import { Shield, UserCheck, Radio, Download, KeyRound, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  userRole: UserRole;
  userName: string;
  onRoleChange: (role: UserRole) => void;
  onUserNameChange: (name: string) => void;
  onOpenMasterPin: () => void;
  deferredInstallPrompt: any;
  onInstallPwa: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole,
  userName,
  onRoleChange,
  onUserNameChange,
  onOpenMasterPin,
  deferredInstallPrompt,
  onInstallPwa
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUserNameChange(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <img 
              src="/logo.jpg" 
              alt="Sincronía Logo" 
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20" 
            />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                Sincronía
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hidden sm:inline-block">
                PWA Realtime
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">Gestión Interactiva de Tareas en Tiempo Real</p>
          </div>
        </div>

        {/* User Controls & Role Toggle */}
        <div className="flex items-center gap-3">
          
          {/* Live Sync Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>En Vivo</span>
          </div>

          {/* User Name Tag */}
          <div className="relative">
            {isEditingName ? (
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-indigo-500/50">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="bg-transparent text-xs text-white px-2 py-0.5 outline-none w-28"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded hover:bg-indigo-500"
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 px-3 py-1.5 rounded-xl text-xs text-slate-200 transition-all"
                title="Haz clic para cambiar tu nombre de usuario"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-[10px]">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium max-w-[90px] truncate">{userName}</span>
              </button>
            )}
          </div>

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onRoleChange('leader')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                userRole === 'leader'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Líder</span>
            </button>
            <button
              onClick={() => onRoleChange('collaborator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                userRole === 'collaborator'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Colaborador</span>
            </button>
          </div>

          {/* Master PIN Settings */}
          <button
            onClick={onOpenMasterPin}
            className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all"
            title="Configurar Contraseña PIN de Seguridad"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          {/* Install PWA Prompt Button */}
          {deferredInstallPrompt && (
            <button
              onClick={onInstallPwa}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 text-xs font-medium transition-all shadow-sm animate-pulse-glow"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Instalar App</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
