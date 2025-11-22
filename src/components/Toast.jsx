"use client";
import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const toast = {
  success: (message) => dispatchToast('success', message),
  error: (message) => dispatchToast('error', message),
  info: (message) => dispatchToast('info', message),
  warning: (message) => dispatchToast('warning', message),
};

function dispatchToast(type, message) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('bookly-toast', {
      detail: { id: Date.now() + Math.random(), type, message }
    });
    window.dispatchEvent(event);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const newToast = event.detail;
      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
    };

    window.addEventListener('bookly-toast', handleToast);
    return () => {
      window.removeEventListener('bookly-toast', handleToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600',
          button: 'hover:bg-green-100 text-green-600'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600',
          button: 'hover:bg-red-100 text-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
          button: 'hover:bg-yellow-100 text-yellow-600'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600',
          button: 'hover:bg-blue-100 text-blue-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600',
          button: 'hover:bg-gray-100 text-gray-600'
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const colors = getColors(toast.type);
        return (
          <div
            key={toast.id}
            className={`
              ${colors.bg} ${colors.border} ${colors.text}
              border-2 rounded-xl shadow-lg p-4 min-w-[300px] max-w-[400px]
              pointer-events-auto
              animate-slideInRight
              flex items-start gap-3
            `}
          >
            <div className={`${colors.icon} flex-shrink-0 mt-0.5`}>
              {getIcon(toast.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`${colors.button} flex-shrink-0 p-1 rounded transition-colors`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

