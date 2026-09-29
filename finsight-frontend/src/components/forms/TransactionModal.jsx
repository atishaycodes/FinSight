import { useState, useEffect } from "react";
import { Modal, FormField, Spinner } from "../ui/index.jsx";
import { transactionsApi, categoriesApi } from "../../api/index.js";
import { useToast } from "../../context/ToastContext.jsx";
import { extractApiError } from "../../utils/index.js";

const today = new Date().toISOString().slice(0, 10);

export default function TransactionModal({ open, onClose, onSaved, editing }) {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);

  const [type,        setType]        = useState("EXPENSE");
  const [description, setDescription] = useState("");
  const [amount,      setAmount]      = useState("");
  const [categoryId,  setCategoryId]  = useState("");
  const [date,        setDate]        = useState(today);
  const [errors,      setErrors]      = useState({});

  // Load categories on open
  useEffect(() => {
    if (open) {
      categoriesApi.list().then(setCategories).catch(() => {});
    }
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (editing) {
      setType(editing.type || "EXPENSE");
      setDescription(editing.description || "");
      setAmount(String(editing.amount ?? ""));
      setCategoryId(editing.categoryId || "");
      setDate(editing.date ? new Date(editing.date).toISOString().slice(0, 10) : today);
    } else {
      setType("EXPENSE");
      setDescription("");
      setAmount("");
      setCategoryId(categories[0]?.id ?? "");
      setDate(today);
    }
    setErrors({});
  }, [editing, open, categories]);

  function validate() {
    const e = {};
    if (!description.trim()) e.description = "Description is required";
    if (!amount || parseFloat(amount) <= 0) e.amount = "Enter a valid amount";
    if (!categoryId) e.categoryId = "Select a category";
    if (!date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      if (editing) {
        await transactionsApi.update(editing.id, {
          type, description, amount: parseFloat(amount), categoryId, date,
        });
        toast.success("Transaction updated");
      } else {
        await transactionsApi.create({
          type, description, amount: parseFloat(amount), categoryId, date,
        });
        toast.success("Transaction saved");
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit transaction" : "Add transaction"}
    >
      {/* Type toggle */}
      <div className="flex gap-2 mb-4">
        {["EXPENSE", "INCOME"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-[3px] text-[12px] font-sans border transition-all
              flex items-center justify-center gap-1.5 font-medium
              ${type === t
                ? t === "EXPENSE"
                  ? "bg-fred-bg text-fred border-fred-bd"
                  : "bg-fgreen-bg text-fgreen border-fgreen-bd"
                : "bg-white text-ink-3 border-border hover:border-ink-4"
              }`}
          >
            <i className={t === "EXPENSE" ? "ti-trending-down" : "ti-trending-up"} />
            {t === "EXPENSE" ? "Expense" : "Income"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <FormField label="Description" error={errors.description}>
          <input
            className="input"
            placeholder="e.g. Groceries at DMart"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>

        <FormField label="Amount (₹)" error={errors.amount}>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Category" error={errors.categoryId}>
            <select
              className="input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Date" error={errors.date}>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <button className="btn-ghost" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner size={14} /> : editing ? "Save changes" : "Save transaction"}
        </button>
      </div>
    </Modal>
  );
}
