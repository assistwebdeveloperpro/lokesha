"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { consumeRedirectToast } from "./redirectToast";

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

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
      <path d="M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm6.927 8.2l-6.845 9.289a1.011 1.011 0 01-1.43.188l-4.888-3.908a1 1 0 111.25-1.562l4.076 3.261 6.227-8.451a1 1 0 111.61 1.183z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
      <path d="M11.983 0a12.206 12.206 0 00-8.51 3.653A11.8 11.8 0 000 12.207 11.779 11.779 0 0011.8 24h.214A12.111 12.111 0 0024 11.791 11.766 11.766 0 0011.983 0zM10.5 16.542a1.476 1.476 0 011.449-1.53h.027a1.527 1.527 0 011.523 1.47 1.475 1.475 0 01-1.449 1.53h-.027a1.529 1.529 0 01-1.523-1.47zM11 12.5v-6a1 1 0 012 0v6a1 1 0 11-2 0z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 14 16" width="14" height="16" aria-hidden>
      <path
        fillRule="evenodd"
        d="M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z"
      />
    </svg>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
      setToasts((prev) => [{ id, message, type }, ...prev]);
      startTimer(id, TOAST_DURATION_MS);
    },
    [startTimer],
  );

  useEffect(() => {
    const redirectToast = consumeRedirectToast();
    if (redirectToast) {
      showToast(redirectToast.message, redirectToast.type);
    }
  }, [pathname, showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="app-toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`app-toast app-toast--${toast.type}`}
            onClick={() => dismissToast(toast.id)}
            onMouseEnter={() => pauseTimer(toast.id)}
            onMouseLeave={() => resumeTimer(toast.id)}
          >
            <span className="app-toast__icon">
              {toast.type === "success" ? <SuccessIcon /> : <ErrorIcon />}
            </span>
            <span className="app-toast__message">{toast.message}</span>
            <button
              type="button"
              aria-label="close"
              className="app-toast__close"
              onClick={(event) => {
                event.stopPropagation();
                dismissToast(toast.id);
              }}
            >
              <CloseIcon />
            </button>
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
