import { useState, useEffect, useCallback } from "react";
import { budgetsApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { LoadingPage, EmptyState, ConfirmDialog } from "../components/ui/index.jsx";
import BudgetModal from "../components/forms/BudgetModal.jsx";
import { formatCurrency, currentMonthYear, monthLabel, extractApiError } from "../utils/index.js";

export default function BudgetsPage() {
  const { user }   = useAuth();
  const toast      = useToast();
  const { month, year } = currentMonthYear();

  const [budgets,    setBudgets]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await budgetsApi.list(month, year);
      setBudgets(data);
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, [month, year, toast]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await budgetsApi.delete(confirmDel.id);
      toast.success("Budget deleted");
      setConfirmDel(null);
      load();
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setDeleting(false);
    }
  }

  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount || 0), 0);
  const totalSpent  = budgets.reduce((s, b) => s + Number(b.spent || 0),  0);

  return (
    <div className="px-9 py-9 pb-12">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="page-title">
            Budgets —{" "}
            <em className="not-italic font-normal">{monthLabel(month, year)}</em>
          </h1>
          <p className="text-[12px] text-ink-3 mt-1">
            Set monthly limits per category and track your spending
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setEditing(null); setModalOpen(true); }}
        >
          <i className="ti-plus" /> New budget
        </button>
      </div>

      {/* Overview strip */}
      {budgets.length > 0 && (
        <div className="flex gap-6 mt-5 mb-6 p-4 card">
          <div>
            <div className="text-[10px] text-ink-4 uppercase tracking-[.04em] mb-1">
              Total budgeted
            </div>
            <div className="num text-[22px] font-bold text-ink">
              {formatCurrency(totalBudget, user?.currency)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-ink-4 uppercase tracking-[.04em] mb-1">
              Total spent
            </div>
            <div className="num text-[22px] font-bold text-fred">
              {formatCurrency(totalSpent, user?.currency)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-ink-4 uppercase tracking-[.04em] mb-1">
              Remaining
            </div>
            <div className="num text-[22px] font-bold text-fgreen">
              {formatCurrency(totalBudget - totalSpent, user?.currency)}
            </div>
          </div>
          <div className="ml-auto flex items-center">
            <div className="text-right">
              <div className="text-[10px] text-ink-4 uppercase tracking-[.04em] mb-1">
                Overall used
              </div>
              <div
                className={`num text-[22px] font-bold
                  ${totalBudget > 0 && totalSpent / totalBudget >= 0.9 ? "text-fred" :
                    totalBudget > 0 && totalSpent / totalBudget >= 0.7 ? "text-famber" : "text-fgreen"}`}
              >
                {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}%` : "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingPage />
      ) : budgets.length === 0 ? (
        <EmptyState
          icon="ti-target"
          title="No budgets set"
          body="Create a budget for each spending category to track your limits"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {budgets.map((b) => {
            const statusColor =
              b.pct >= 90 ? "#c0382b" :
              b.pct >= 70 ? "#8f5a1a" : "#1a6e3c";
            const statusText =
              b.pct >= 90 ? "Over budget risk" :
              b.pct >= 70 ? "Approaching limit" : "On track";

            return (
              <div key={b.id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-[3px] flex items-center justify-center text-[14px]"
                      style={{ background: `${b.category?.color || "#7a7669"}18`, color: b.category?.color || "#7a7669" }}
                    >
                      <i className={b.category?.icon || "ti-circle"} />
                    </div>
                    <span className="font-serif text-[15px] font-semibold text-ink">
                      {b.category?.name || "General"}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      className="text-ink-4 hover:text-ink text-[14px] transition-colors"
                      onClick={() => { setEditing(b); setModalOpen(true); }}
                      title="Edit"
                    >
                      <i className="ti-edit" />
                    </button>
                    <button
                      className="text-ink-4 hover:text-fred text-[14px] transition-colors"
                      onClick={() => setConfirmDel(b)}
                      title="Delete"
                    >
                      <i className="ti-trash" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-ink-3 mb-2">
                  <div>
                    Spent{" "}
                    <span className="num text-[14px] font-bold text-ink">
                      {formatCurrency(b.spent, user?.currency)}
                    </span>
                  </div>
                  <div>
                    Limit{" "}
                    <span className="num text-[14px] font-bold text-ink">
                      {formatCurrency(b.amount, user?.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="num text-[14px] font-bold" style={{ color: b.category?.color || "#7a7669" }}>
                      {b.pct}%
                    </span>
                  </div>
                </div>

                <div className="h-1.5 bg-cream-3 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width:      `${Math.min(b.pct, 100)}%`,
                      background: b.category?.color || "#1a6e3c",
                    }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium" style={{ color: statusColor }}>
                    {statusText}
                  </span>
                  <span className="text-[11px] text-ink-3">
                    {formatCurrency(Math.max(b.remaining, 0), user?.currency)} remaining
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BudgetModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSaved={load}
        editing={editing}
        month={month}
        year={year}
      />

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
        loading={deleting}
        danger
        title="Delete budget"
        message={`Delete the "${confirmDel?.category?.name}" budget? This cannot be undone.`}
      />
    </div>
  );
}
