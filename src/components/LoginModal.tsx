import React, { useState } from 'react';
import { User, LogIn, Sparkles, Shield, UserCheck } from 'lucide-react';
import { UserSession } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (firstName: string, lastName: string) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLogin, onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    onLogin(firstName.trim(), lastName.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img 
            src="/logo.jpg" 
            alt="Synchro Logo" 
            className="w-14 h-14 rounded-2xl mx-auto object-cover ring-4 ring-cyan-500/30 shadow-xl shadow-cyan-500/20 mb-3" 
          />
          <h3 className="text-2xl font-extrabold text-white tracking-tight">Ingreso a Synchro</h3>
          <p className="text-xs text-slate-400">Ingresa tu Nombre y Apellido para identificarte en las tareas.</p>
        </div>

        {/* Login Card Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Nombre *</label>
              <input
                type="text"
                placeholder="Ej. Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Apellido *</label>
              <input
                type="text"
                placeholder="Ej. Pérez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 mt-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Ingresar al Sistema</span>
          </button>

        </form>

      </div>
    </div>
  );
};
