"use client";
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const AnimatedCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
    <motion.path
      d="M20 6L9 17l-5-5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  </svg>
);

const AnimatedError = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
    <motion.path
      d="M18 6L6 18"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    />
    <motion.path
      d="M6 6l12 12"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
    />
  </svg>
);

const AnimatedInfo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
    <motion.circle
      cx="12" cy="12" r="10"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
    />
    <motion.path
      d="M12 16v-4"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    />
    <motion.path
      d="M12 8h.01"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2, delay: 0.4 }}
    />
  </svg>
);

const AnimatedWarning = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
    <motion.path
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
    <motion.path
      d="M12 9v4"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    />
    <motion.path
      d="M12 17h.01"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2, delay: 0.5 }}
    />
  </svg>
);

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const newToast = event.detail;
      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after 4 seconds for a snappier feel
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
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
      case 'success': return <AnimatedCheck />;
      case 'error': return <AnimatedError />;
      case 'warning': return <AnimatedWarning />;
      case 'info': return <AnimatedInfo />;
      default: return <AnimatedInfo />;
    }
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50/95 border-emerald-200/50 text-emerald-900';
      case 'error':
        return 'bg-red-50/95 border-red-200/50 text-red-900';
      case 'warning':
        return 'bg-amber-50/95 border-amber-200/50 text-amber-900';
      case 'info':
        return 'bg-blue-50/95 border-blue-200/50 text-blue-900';
      default:
        return 'bg-white/95 border-gray-200/50 text-gray-900';
    }
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none min-w-[300px] max-w-[400px]">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`
              backdrop-blur-md
              border
              shadow-[0_8px_30px_rgb(0,0,0,0.04)]
              rounded-2xl p-4
              pointer-events-auto
              flex items-center gap-4
              group
              ${getToastStyles(toast.type)}
            `}
          >
            <div className="flex-shrink-0">
              {getIcon(toast.type)}
            </div>

            <p className="flex-1 text-[13px] font-medium leading-snug">
              {toast.message}
            </p>

            <button
              onClick={() => removeToast(toast.id)}
              className="
                flex-shrink-0 opacity-40
                hover:opacity-100 hover:bg-black/5
                transition-all duration-200 
                p-1.5 rounded-full
              "
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
