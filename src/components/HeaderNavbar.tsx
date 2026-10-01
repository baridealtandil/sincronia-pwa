import React, { useState } from 'react';
import { Bell, CheckCircle2, User, Sparkles, X } from 'lucide-react';
import { AppNotification } from '../types';

interface HeaderNavbarProps {
  userRole: 'leader' | 'collaborator';
  userName: string;
  notifications: AppNotification[];
  onRoleChange: (role: 'leader' | 'collaborator') => void;
  onUserNameChange: (name: string) => void;
  onMarkNotificationsRead: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  userRole,
  userName,
  notifications,
  onRoleChange,
  onUserNameChange,
  onMarkNotificationsRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-extrabold text-sm">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-tight">Sincronía</h1>
            <p className="text-[10px] text-indigo-400 font-medium">Gestión Simple por Tarjetas</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) {
                  onMarkNotificationsRead();
                }
              }}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white relative transition-all"
              title="Notificaciones de lectura y finalización"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-400" />
                    Notificaciones en Vivo
                  </h4>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No hay notificaciones aún.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-xs ${
                          n.type === 'completed'
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                            : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
                        }`}
                      >
                        <h5 className="font-bold text-[11px] mb-0.5">{n.title}</h5>
                        <p className="text-[11px] text-slate-300 leading-snug">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                onRoleChange('leader');
                onUserNameChange('Carlos (Líder)');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                userRole === 'leader'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👑 Jefe
            </button>
            <button
              onClick={() => {
                onRoleChange('collaborator');
                onUserNameChange('Sofía');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                userRole === 'collaborator'
                  ? 'bg-cyan-600 text-white shadow-md'
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
