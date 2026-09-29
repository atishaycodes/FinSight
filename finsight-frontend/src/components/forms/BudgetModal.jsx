import { useState, useEffect } from "react";
import { Modal, FormField, Spinner } from "../ui/index.jsx";
import { budgetsApi, categoriesApi } from "../../api/index.js";
import { useToast } from "../../context/ToastContext.jsx";
import { extractApiError } from "../../utils/index.js";

export default function BudgetModal({ open, onClose, onSaved, editing, month, year }) {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount,     setAmount]     = useState("");
  const [errors,     setErrors]     = useState({});

  useEffect(() => {
    if (open) {
      categoriesApi.list().then(setCategories).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (editing) {
      setCategoryId(editing.categoryId);
      setAmount(String(editing.amount));
    } else {
      setCategoryId(categories[0]?.id ?? "");
      setAmount("");
    }
    setErrors({});
  }, [editing, open, categories]);

  function validate() {
    const e = {};
    if (!categoryId)                        e.categoryId = "Select a category";
    if (!amount || parseFloat(amount) <= 0) e.amount = "Enter a valid amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      if (editing) {
        await budgetsApi.update(editing.id, parseFloat(amount));
        toast.success("Budget updated");
      } else {
        await budgetsApi.create({ categoryId, amount: parseFloat(amount), month, year });
        toast.success("Budget created");
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }

  const monthName = new Date(year, month - 1, 1)
    .toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit budget" : "New budget"}
      width="max-w-[380px]"
    >
      <p className="text-[12px] text-ink-3 mb-5">
        Setting a monthly limit for <strong>{monthName}</strong>
      </p>

      <div className="flex flex-col gap-3">
        <FormField label="Category" error={errors.categoryId}>
          <select
            className="input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!!editing}
          >
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Monthly limit (₹)" error={errors.amount}>
          <input
            className="input"
            type="number"
            min="0"
            step="100"
            placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <button className="btn-ghost" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner size={14} /> : editing ? "Save changes" : "Create budget"}
        </button>
      </div>
    </Modal>
  );
}
