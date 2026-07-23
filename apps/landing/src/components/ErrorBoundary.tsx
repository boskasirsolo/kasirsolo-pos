'use client';

import React, { Component, ErrorInfo, PropsWithChildren } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  message?: string;
  replayLabel?: string;
}

const DEFAULT_TITLE = 'Ups, Ada Masalah';
const DEFAULT_MESSAGE =
  'Sepertinya ada bagian yang bermasalah. Tenang, kami sedang memperbaikinya! Coba refresh halaman atau kembali sebentar lagi.';
const DEFAULT_REPLAY_LABEL = 'Refresh Halaman';

const DefaultFallback: React.FC<{
  title: string;
  message: string;
  onRetry: () => void;
  replayLabel: string;
}> = ({ title, message, onRetry, replayLabel }) => (
  <div className="error-boundary-fallback" style={{ padding: '32px 24px', textAlign: 'center' }}>
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.1)',
        marginBottom: 16,
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 9v4m-2 2h4m-5.514-13.5l10 17A1.986 1.986 0 0116 21H8a2 2 0 01-1.735-2.9l9-17a2 2 0 013.468 0z"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <h3
      style={{
        fontSize: '1.1rem',
        fontWeight: 600,
        color: '#fff',
        marginBottom: 8,
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      {title}
    </h3>
    <p
      style={{
        fontSize: '0.9rem',
        color: '#A0A0A0',
        maxWidth: 400,
        margin: '0 auto 20px',
        lineHeight: 1.5,
      }}
    >
      {message}
    </p>
    <button
      onClick={onRetry}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 28px',
        borderRadius: 'var(--radius-full, 9999px)',
        background: 'linear-gradient(135deg, #F7A237, #FF5F1F, #E5451B)',
        color: '#fff',
        fontWeight: 600,
        fontSize: '0.95rem',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 20px rgba(255, 95, 31, 0.3)',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 4v5h5M20 20v-5h-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.49 9A9 9 0 005.64 5.64L4 4m16 16l-1.64-1.64A9 9 0 013.51 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {replayLabel}
    </button>
  </div>
);

export class ErrorBoundary extends Component<PropsWithChildren<ErrorBoundaryProps>, ErrorBoundaryState> {
  constructor(props: PropsWithChildren<ErrorBoundaryProps>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught:', error, errorInfo.componentStack);
  }

  handleRetry = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      const { fallback, title, message, replayLabel } = this.props;
      if (fallback !== undefined) return fallback;

      return (
        <DefaultFallback
          title={title ?? DEFAULT_TITLE}
          message={message ?? DEFAULT_MESSAGE}
          replayLabel={replayLabel ?? DEFAULT_REPLAY_LABEL}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
