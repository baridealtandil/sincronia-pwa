import React, { useState } from 'react';
import { Users, UserPlus, Shield, UserCheck, X, Check, Share2, Sparkles, ArrowRight } from 'lucide-react';
import { TeamMember, UserRole } from '../types';

interface TeamModalProps {
  isOpen: boolean;
  projectId: string;
  projectName: string;
  currentUserRole: UserRole;
  currentUserName: string;
  members: TeamMember[];
  onAddMember: (name: string, role: UserRole) => void;
  onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  projectId,
  projectName,
  currentUserRole,
  currentUserName,
  members,
  onAddMember,
  onClose
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('subcollaborator');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    onAddMember(newMemberName.trim(), newMemberRole);
    setNewMemberName('');
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/?project=${projectId}&inviter=${encodeURIComponent(currentUserName)}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
            <Users className="w-5 h-5" />
            <span>Gestión de Equipo & Sub-colaboradores</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleAdd} className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-indigo-400" />
            Invitar / Agregar Nuevo Miembro o Sub-colaborador
          </h4>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Nombre del nuevo colaborador..."
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />

            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {currentUserRole === 'leader' && <option value="manager">👔 Encargado Principal</option>}
              <option value="subcollaborator">👷 Sub-colaborador</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md hover:bg-indigo-500 whitespace-nowrap"
            >
              Agregar
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
            <span className="text-slate-400 text-[11px]">O comparte el enlace directo de invitación:</span>
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
            </button>
          </div>
        </form>

        {/* Team Hierarchy Tree List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Estructura del Equipo ({members.length} miembros)
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    member.role === 'leader'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : member.role === 'manager'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {member.role === 'leader' ? '👑' : member.role === 'manager' ? '👔' : '👷'}
                  </div>

                  <div>
                    <h5 className="font-semibold text-white">{member.name}</h5>
                    <p className="text-[10px] text-slate-500">Invitado por: {member.invitedBy}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  member.role === 'leader'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : member.role === 'manager'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}>
                  {member.role === 'leader' ? 'Jefe / Líder' : member.role === 'manager' ? 'Encargado' : 'Sub-colaborador'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
