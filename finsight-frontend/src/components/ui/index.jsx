/* ── Spinner ─────────────────────────────────────────── */
export function Spinner({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin inline-block"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity=".2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── SummaryCard ─────────────────────────────────────── */
export function SummaryCard({
  label, value, delta, deltaLabel, accent = "text-ink", children, icon,
}) {
  const isPositive = delta !== null && delta !== undefined && delta >= 0;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-1.5 text-[11px] text-ink-4 uppercase tracking-[.04em] mb-3">
        {icon && <i className={`${icon} text-[14px]`} />}
        {label}
      </div>
      <div className={`num text-[32px] font-bold leading-none mb-2 ${accent}`}>
        {value}
      </div>
      {delta !== null && delta !== undefined && (
        <div className={`text-[11px] flex items-center gap-1 ${isPositive ? "text-fgreen" : "text-fred"}`}>
          <i className={`${isPositive ? "ti-arrow-up" : "ti-arrow-down"} text-[11px]`} />
          {deltaLabel ?? `${Math.abs(delta)}% vs last month`}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── EmptyState ──────────────────────────────────────── */
export function EmptyState({ icon, title, body }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <i className={`${icon} text-[36px] text-cream-3 mb-4`} />
      <div className="text-[14px] font-medium text-ink-3">{title}</div>
      {body && <div className="text-[12px] text-ink-4 mt-1 max-w-xs">{body}</div>}
    </div>
  );
}

/* ── LoadingPage ─────────────────────────────────────── */
export function LoadingPage() {
  return (
    <div className="flex items-center justify-center py-32 text-ink-3">
      <Spinner size={24} />
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, width = "max-w-[420px]" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-ink/50 flex items-center justify-center z-[300] p-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-white border border-border rounded-[4px] w-full ${width} p-7 shadow-xl`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-[17px] font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-3 hover:text-ink text-[18px] leading-none transition-colors"
          >
            <i className="ti-x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── ConfirmDialog ───────────────────────────────────── */
export function ConfirmDialog({
  open, onClose, onConfirm, title, message, danger, loading,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-[380px]">
      <p className="text-[13px] text-ink-3 mb-6 leading-relaxed">{message}</p>
      <div className="flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button
          className={danger ? "btn-danger" : "btn-primary"}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <Spinner size={14} /> : "Confirm"}
        </button>
      </div>
    </Modal>
  );
}

/* ── FormField ───────────────────────────────────────── */
export function FormField({
  label, error, children,
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-[11px] text-fred mt-1">{error}</p>}
    </div>
  );
}
