import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CareOps ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto my-12 bg-white rounded-2xl border border-slate-200/90 shadow-xs text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900 mb-1.5">
            {this.props.fallbackTitle || 'Unable to display view'}
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            An unexpected error was intercepted safely. You can refresh this view or switch back to the main dashboard.
          </p>
          <div className="flex items-center justify-center gap-2.5">
            <button
              onClick={this.handleReset}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload View
            </button>
            <button
              onClick={() => {
                this.handleReset();
                if (this.props.onReset) {
                  this.props.onReset();
                }
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Back to Overview
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
