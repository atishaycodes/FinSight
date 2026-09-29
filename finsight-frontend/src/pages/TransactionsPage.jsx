import { useState, useEffect, useCallback } from "react";
import { transactionsApi, categoriesApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  LoadingPage, EmptyState, ConfirmDialog,
} from "../components/ui/index.jsx";
import TransactionModal from "../components/forms/TransactionModal.jsx";
import {
  formatCurrency, formatShortDate, extractApiError, downloadCsv,
} from "../utils/index.js";

const LIMIT = 20;

export default function TransactionsPage() {
  const { user }  = useAuth();
  const toast     = useToast();

  const [transactions, setTransactions] = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [loading,      setLoading]      = useState(true);

  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [catFilter,  setCatFilter]  = useState("");
  const [from,       setFrom]       = useState("");
  const [to,         setTo]         = useState("");

  const [modalOpen,   setModalOpen]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [deleting,    setDeleting]    = useState(false);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        page, limit: LIMIT,
        search:     search     || undefined,
        type:       typeFilter || undefined,
        categoryId: catFilter  || undefined,
        from:       from       || undefined,
        to:         to         || undefined,
      };
      const res = await transactionsApi.list(filters);
      setTransactions(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, catFilter, from, to, toast]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, typeFilter, catFilter, from, to]);

  async function handleDelete() {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await transactionsApi.delete(confirmDel.id);
      toast.success("Transaction deleted");
      setConfirmDel(null);
      load();
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setDeleting(false);
    }
  }

  function handleExport() {
    if (!transactions.length) {
      toast.info("No transactions to export");
      return;
    }
    downloadCsv(transactions, `finsight-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("Transactions exported to CSV");
  }

  return (
    <div className="px-9 py-9 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="text-[12px] text-ink-3 mt-1">Review, filter, and manage all your income and expenses</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-ghost flex items-center gap-1.5"
            onClick={handleExport}
            disabled={loading || transactions.length === 0}
            title="Download CSV"
          >
            <i className="ti-download" /> Export CSV
          </button>
          <button
            className="btn-primary"
            onClick={() => { setEditing(null); setModalOpen(true); }}
          >
            <i className="ti-plus" /> Add transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-border
                        rounded-[3px] px-3 py-2">
          <i className="ti-search text-ink-4 text-[14px]" />
          <input
            className="border-none outline-none text-[12px] font-sans text-ink bg-transparent w-full"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input w-auto min-w-[130px]"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>

        <select
          className="input w-auto min-w-[140px]"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          className="input w-auto"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          title="From date"
        />
        <input
          className="input w-auto"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          title="To date"
        />

        {(search || typeFilter || catFilter || from || to) && (
          <button
            className="btn-ghost text-[12px]"
            onClick={() => {
              setSearch(""); setTypeFilter(""); setCatFilter(""); setFrom(""); setTo("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Summary strip */}
      <div className="text-[11px] text-ink-4 mb-3">
        {total} transaction{total !== 1 ? "s" : ""}
        {total > LIMIT && ` — page ${page} of ${totalPages}`}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingPage />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="ti-receipt-off"
          title="No transactions found"
          body="Try adjusting your filters or add a new transaction"
        />
      ) : (
        <div className="card overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_130px_110px_130px] bg-cream-2 border-b border-border
                          px-5 py-2.5 text-[10px] text-ink-3 uppercase tracking-[.06em] font-medium">
            <span>Description</span>
            <span>Category</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
          </div>

          {transactions.map((tx) => {
            const isInc = tx.type === "INCOME";
            return (
              <div
                key={tx.id}
                className="grid grid-cols-[1fr_130px_110px_130px] px-5 py-3
                           border-b border-border last:border-none hover:bg-cream-2
                           transition-colors items-center"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-[3px] flex items-center justify-center text-[13px] flex-shrink-0"
                    style={{
                      background: isInc ? "#eaf3ed" : "#fcecea",
                      color:      tx.category?.color || "#7a7669",
                    }}
                  >
                    <i className={tx.category?.icon || "ti-circle"} />
                  </div>
                  <span className="text-[12px] font-medium text-ink truncate">
                    {tx.description}
                  </span>
                </div>

                <span className="text-[11px] text-ink-3">{tx.category?.name || "General"}</span>
                <span className="text-[11px] text-ink-3">{formatShortDate(tx.date)}</span>

                <div className="flex items-center justify-end gap-3">
                  <span className={`num text-[13px] font-bold ${isInc ? "text-fgreen" : "text-fred"}`}>
                    {isInc ? "+" : "−"}{formatCurrency(tx.amount, user?.currency)}
                  </span>
                  <button
                    className="text-ink-4 hover:text-ink text-[14px] transition-colors"
                    onClick={() => { setEditing(tx); setModalOpen(true); }}
                    title="Edit"
                  >
                    <i className="ti-edit" />
                  </button>
                  <button
                    className="text-ink-4 hover:text-fred text-[14px] transition-colors"
                    onClick={() => setConfirmDel(tx)}
                    title="Delete"
                  >
                    <i className="ti-trash" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            className="btn-ghost text-[12px] py-1.5 px-3"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className="text-[12px] text-ink-3">
            {page} / {totalPages}
          </span>
          <button
            className="btn-ghost text-[12px] py-1.5 px-3"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSaved={load}
        editing={editing}
      />

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
        loading={deleting}
        danger
        title="Delete transaction"
        message={`Delete "${confirmDel?.description}"? This cannot be undone.`}
      />
    </div>
  );
}
