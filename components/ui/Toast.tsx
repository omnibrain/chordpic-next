import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

interface ToastOptions {
  title: string;
  description?: string;
  status?: "success" | "error" | "info";
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

const ToastContext = createContext<(options: ToastOptions) => void>(() => {});

let nextId = 0;

export const ToastProvider: React.FunctionComponent<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, ...options }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, options.duration ?? 6000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map(({ id, title, description, status }) => (
          <div
            key={id}
            role="status"
            className="pointer-events-auto w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  status === "error"
                    ? "bg-red-500"
                    : status === "success"
                      ? "bg-emerald-500"
                      : "bg-zinc-400"
                }`}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {title}
                </p>
                {description && (
                  <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {description}
                  </p>
                )}
              </div>
              <button
                aria-label="Dismiss"
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== id))
                }
                className="ml-auto text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
