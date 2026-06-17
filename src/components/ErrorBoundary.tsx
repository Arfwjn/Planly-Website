/**
 * =============================================================================
 * Planly — ErrorBoundary.tsx
 * 
 * Kegunaan:
 * Berkas kode dalam proyek Planly.
 * 
 * Relasi & Dependency:
 * - Berhubungan dengan modul utama aplikasi.
 * 
 * Aliran Data / State:
 * - Mengikuti alur data terpadu (REST API / local mock storage).
 * =============================================================================
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside components:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-on-surface font-sans selection:bg-slate-200">
          <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-md text-center space-y-6">
            {/* Red Alert Icon with soft red ring */}
            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 animate-pulse">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-on-surface">Waduh, terjadi kesalahan!</h1>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Planly mendeteksi adanya error pada tampilan sistem. Jangan khawatir, data akademismu tetap aman di server.
              </p>
            </div>

            {/* Error Message Details box */}
            {this.state.error && (
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-left text-xs font-mono text-slate-600 overflow-x-auto max-h-28">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={this.handleReload}
                className="w-full h-11 bg-primary hover:bg-[#4F46E5] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Muat Ulang Halaman</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
