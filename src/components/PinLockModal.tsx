import React, { useState, useEffect } from 'react';
import { Lock, Fingerprint, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { authenticateBiometrics } from '../services/biometrics';

interface PinLockModalProps {
  isOpen: boolean;
  targetName: string;
  expectedPin: string;
  allowBiometrics?: boolean;
  onSuccess: () => void;
  onClose?: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  targetName,
  expectedPin,
  allowBiometrics = true,
  onSuccess,
  onClose
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isAuthenticatingBio, setIsAuthenticatingBio] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === expectedPin) {
          setTimeout(() => {
            onSuccess();
            setPin('');
          }, 150);
        } else {
          setError(true);
          if (navigator.vibrate) navigator.vibrate(200);
          setTimeout(() => {
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleBiometricAuth = async () => {
    setIsAuthenticatingBio(true);
    try {
      const res = await authenticateBiometrics(`Desbloquear ${targetName}`);
      if (res.success) {
        onSuccess();
      } else if (res.message) {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setIsAuthenticatingBio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className={`w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl transition-transform ${error ? 'animate-bounce' : ''}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Acceso Protegido</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Lock Icon & Info */}
        <div className="text-center my-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{targetName}</h3>
          <p className="text-xs text-slate-400">Ingresa la contraseña de 4 dígitos o usa Face ID / Touch ID</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-4 my-6">
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  error
                    ? 'bg-red-500 border-red-500 shadow-red-500/50 shadow-md'
                    : filled
                    ? 'bg-indigo-500 border-indigo-400 scale-110 shadow-indigo-500/50 shadow-md'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-red-400 text-xs text-center mb-4 bg-red-500/10 py-1.5 rounded-lg border border-red-500/20">
            <AlertCircle className="w-4 h-4" />
            <span>Contraseña incorrecta. Intenta nuevamente (PIN por defecto: 1234)</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-slate-800/70 border border-slate-700/60 text-xl font-bold text-white hover:bg-indigo-600 hover:border-indigo-500 active:scale-95 transition-all shadow-sm flex items-center justify-center"
            >
              {num}
            </button>
          ))}

          {/* Biometrics / FaceID Button */}
          {allowBiometrics ? (
            <button
              onClick={handleBiometricAuth}
              disabled={isAuthenticatingBio}
              className="h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-900/80 active:scale-95 transition-all flex flex-col items-center justify-center"
              title="Autenticación Biométrica (Face ID / Touch ID)"
            >
              <Fingerprint className="w-6 h-6" />
              <span className="text-[9px] mt-0.5">Face/Touch</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-slate-800/70 border border-slate-700/60 text-xl font-bold text-white hover:bg-indigo-600 hover:border-indigo-500 active:scale-95 transition-all flex items-center justify-center"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center text-sm font-medium"
          >
            Borrar
          </button>
        </div>

        <div className="text-center">
          <span className="text-[11px] text-slate-500">PIN predeterminado de demostración: <strong className="text-indigo-400">1234</strong></span>
        </div>

      </div>
    </div>
  );
};
