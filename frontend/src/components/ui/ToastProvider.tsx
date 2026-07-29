"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastType = "success" | "error";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

type ToastTimer = {
  timerId: ReturnType<typeof setTimeout> | null;
  remainingMs: number;
  startedAt: number;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);
const TOAST_DURATION_MS = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ToastTimer>());

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer?.timerId) {
      clearTimeout(timer.timerId);
    }
    timers.current.delete(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const startTimer = useCallback(
    (id: number, ms: number) => {
      const timerId = setTimeout(() => dismissToast(id), ms);
      timers.current.set(id, { timerId, remainingMs: ms, startedAt: Date.now() });
    },
    [dismissToast],
  );

  const pauseTimer = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (!timer?.timerId) return;
    clearTimeout(timer.timerId);
    timers.current.set(id, {
      timerId: null,
      remainingMs: timer.remainingMs - (Date.now() - timer.startedAt),
      startedAt: timer.startedAt,
    });
  }, []);

  const resumeTimer = useCallback(
    (id: number) => {
      const timer = timers.current.get(id);
      if (!timer || timer.timerId || timer.remainingMs <= 0) return;
      startTimer(id, timer.remainingMs);
    },
    [startTimer],
  );

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, type }]);
      startTimer(id, TOAST_DURATION_MS);
    },
    [startTimer],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="lokesha-toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`lokesha-toast lokesha-toast--${toast.type}`}
            onMouseEnter={() => pauseTimer(toast.id)}
            onMouseLeave={() => resumeTimer(toast.id)}
          >
            <span className="lokesha-toast__icon">
              {toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              ) : (
                <XCircle className="h-5 w-5" aria-hidden />
              )}
            </span>
            <span className="lokesha-toast__message">{toast.message}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="lokesha-toast__close"
              onClick={() => dismissToast(toast.id)}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
            <span
              className="lokesha-toast__progress"
              style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
