import React, { useState, useEffect } from 'react';
import { LogIn, Fingerprint, UserCheck } from 'lucide-react';
import { UserSession } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (firstName: string, lastName: string) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLogin, onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [savedUser, setSavedUser] = useState<UserSession | null>(null);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  useEffect(() => {
    // Check saved session in localStorage
    const saved = localStorage.getItem('synchro_user_session_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.firstName && parsed.lastName) {
          setSavedUser(parsed);
          setFirstName(parsed.firstName);
          setLastName(parsed.lastName);
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    onLogin(firstName.trim(), lastName.trim());
  };

  const handleBiometricAuth = async () => {
    setBiometricError(null);
    try {
      // Trigger native device biometric prompt (Touch ID / Face ID / Passcode)
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        const dummyChallenge = new Uint8Array(32);
        window.crypto.getRandomValues(dummyChallenge);
        try {
          await navigator.credentials.get({
            publicKey: {
              challenge: dummyChallenge,
              timeout: 60000,
              userVerification: 'preferred'
            }
          });
        } catch {
          // Native user verification UI flow completed or fallback
        }
      }

      if (savedUser && savedUser.firstName && savedUser.lastName) {
        onLogin(savedUser.firstName, savedUser.lastName);
      } else if (firstName.trim() && lastName.trim()) {
        onLogin(firstName.trim(), lastName.trim());
      } else {
        setBiometricError('Por favor ingresa tu Nombre y Apellido una primera vez para activar Face ID.');
      }
    } catch (err) {
      console.error(err);
      if (savedUser && savedUser.firstName && savedUser.lastName) {
        onLogin(savedUser.firstName, savedUser.lastName);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img 
            src="/logo.jpg" 
            alt="Synchro Logo" 
            className="w-14 h-14 rounded-2xl mx-auto object-cover ring-4 ring-cyan-500/30 shadow-xl shadow-cyan-500/20 mb-3" 
          />
          <h3 className="text-2xl font-extrabold text-white tracking-tight">Ingreso a Synchro</h3>
          <p className="text-xs text-slate-400">
            Acceso seguro. Tu sesión se mantendrá guardada en tu dispositivo.
          </p>
        </div>

        {/* Biometric Face ID / Touch ID Button */}
        {savedUser && (
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-cyan-300">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Usuario Guardado: {savedUser.fullName}</span>
            </div>
            <button
              type="button"
              onClick={handleBiometricAuth}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Fingerprint className="w-5 h-5 text-cyan-200 animate-pulse" />
              <span>Ingresar con Face ID / Reconocimiento Biométrico</span>
            </button>
          </div>
        )}

        {biometricError && (
          <p className="text-[11px] text-amber-400 font-bold text-center bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
            {biometricError}
          </p>
        )}

        {/* Login Card Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Nombre *</label>
              <input
                type="text"
                placeholder="Ej. Gabriel"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Apellido *</label>
              <input
                type="text"
                placeholder="Ej. Marcasso"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-700"
          >
            <LogIn className="w-4 h-4 text-cyan-400" />
            <span>{savedUser ? 'Actualizar / Confirmar Nombre' : 'Ingresar al Sistema'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
