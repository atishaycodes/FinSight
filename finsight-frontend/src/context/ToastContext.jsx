import {
  createContext, useContext, useState, useCallback,
} from "react";

const ToastContext = createContext(null);
let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = (id) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  const toast = useCallback((message, type = "info") => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), 3000);
  }, []);

  const success = useCallback((m) => toast(m, "success"), [toast]);
  const error   = useCallback((m) => toast(m, "error"),   [toast]);
  const info    = useCallback((m) => toast(m, "info"),    [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-7 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[999] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-5 py-2.5 rounded-[4px] text-[12px] font-sans shadow-lg
              pointer-events-auto whitespace-nowrap transition-all animate-bounce-short
              ${t.type === "success" ? "bg-fgreen text-white" :
                t.type === "error"   ? "bg-fred  text-white" :
                                       "bg-ink   text-cream"}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
