import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

interface InstallPwaBannerProps {
  deferredPrompt: any;
  onInstall: () => void;
}

export const InstallPwaBanner: React.FC<InstallPwaBannerProps> = ({ deferredPrompt, onInstall }) => {
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setIsIOS(true);
    }
  }, []);

  if (dismissed) return null;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-cyan-950/80 via-indigo-950/80 to-slate-900/90 border border-cyan-500/40 p-4 shadow-xl mb-6 relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 flex-shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              Instalar Synchro App en tu Dispositivo
            </h4>
            <p className="text-xs text-slate-300">
              {isIOS 
                ? 'En iPhone/iPad: Toca "Compartir" y selecciona "Agregar a inicio"' 
                : 'Accede en tiempo real desde tu pantalla de inicio.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {deferredPrompt && (
            <button
              onClick={onInstall}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-white font-semibold text-xs shadow-lg hover:bg-cyan-400 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
