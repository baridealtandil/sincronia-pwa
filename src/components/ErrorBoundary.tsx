import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Synchro App Error Boundary caught:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.pathname + '?v=' + Date.now();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl">
            🔄
          </div>
          <h2 className="text-xl font-extrabold">Actualizando Synchro...</h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Se detectó una versión anterior en tu navegador. Pulsa el botón para cargar la app limpia.
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl active:scale-95"
          >
            Actualizar y Cargar Aplicación
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
