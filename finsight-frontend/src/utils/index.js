/* ── Currency ─────────────────────────────────────────── */
export function formatCurrency(
  amount,
  currency = "INR",
  locale   = "en-IN"
) {
  const num = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat(locale, {
      style:                 "currency",
      currency:              currency || "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `₹${Math.round(num)}`;
  }
}

/* ── Dates ────────────────────────────────────────────── */
export function formatDate(dateStr, style = "short") {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return style === "long"
      ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
      : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  } catch {
    return dateStr;
  }
}

/* ── Month/Year helpers ────────────────────────────────── */
export function currentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function monthLabel(month, year) {
  return new Date(year, month - 1, 1)
    .toLocaleString("default", { month: "long", year: "numeric" });
}

/* ── Delta label ────────────────────────────────────────── */
export function deltaLabel(delta) {
  if (delta === null || delta === undefined) return "—";
  const sign = delta >= 0 ? "↑" : "↓";
  return `${sign} ${Math.abs(delta)}%`;
}

/* ── API error extractor ────────────────────────────────── */
export function extractApiError(err) {
  if (err && typeof err === "object" && "response" in err) {
    const e = err;
    return e.response?.data?.message ?? "Something went wrong";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

/* ── CSV Export Helper ─────────────────────────────────── */
export function downloadCsv(data, filename = "transactions.csv") {
  if (!data || !data.length) return;
  const headers = ["ID", "Date", "Description", "Type", "Category", "Amount"];
  const rows = data.map((t) => [
    t.id,
    new Date(t.date).toISOString().slice(0, 10),
    `"${(t.description || "").replace(/"/g, '""')}"`,
    t.type,
    `"${(t.category?.name || "").replace(/"/g, '""')}"`,
    t.amount,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
