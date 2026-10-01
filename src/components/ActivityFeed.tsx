import React from 'react';
import { Activity, Clock, UserCheck, Shield } from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityFeedProps {
  logs: ActivityLog[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs }) => {
  return (
    <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
        <Activity className="w-5 h-5 text-indigo-400" />
        <h3 className="font-bold text-base text-white">Historial de Actividad en Vivo</h3>
      </div>

      {logs.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-6">No hay registros de actividad aún.</p>
      ) : (
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {logs.map((log) => {
            const timeAgo = formatTimeAgo(log.timestamp);
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 transition-all hover:border-slate-700"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  {log.userName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="leading-snug">
                    <strong className="text-slate-100 font-semibold">{log.userName}</strong> ({log.userRole === 'leader' ? 'Líder' : 'Colaborador'}){' '}
                    <span className="text-emerald-400 font-medium">{log.action}</span>{' '}
                    <span className="text-indigo-300 font-semibold">"{log.taskTitle}"</span>
                  </p>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `Hace ${diffSec} segundos`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Hace ${diffMin} minutos`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    return new Date(isoString).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recientemente';
  }
}
