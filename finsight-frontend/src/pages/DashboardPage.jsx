import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  SummaryCard, LoadingPage, EmptyState,
} from "../components/ui/index.jsx";
import OverviewBarChart  from "../components/charts/OverviewBarChart.jsx";
import CategoryDonutChart from "../components/charts/CategoryDonutChart.jsx";
import {
  formatCurrency, formatShortDate, currentMonthYear,
  monthLabel, extractApiError,
} from "../utils/index.js";

export default function DashboardPage() {
  const { user }   = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();

  const { month, year } = currentMonthYear();

  const [summary,   setSummary]   = useState(null);
  const [trend,     setTrend]     = useState(null);
  const [insights,  setInsights]  = useState([]);
  const [trendRange, setTrendRange] = useState(6);
  const [loading,   setLoading]   = useState(true);

  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t, ins] = await Promise.all([
        analyticsApi.dashboard(month, year),
        analyticsApi.trend(trendRange),
        analyticsApi.insights(),
      ]);
      setSummary(s);
      setTrend(t);
      setInsights(ins);
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, [month, year, trendRange, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingPage />;

  const s = summary?.summary;

  return (
    <div className="px-9 py-9 pb-12">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-serif text-[24px] font-semibold text-ink">
          Good day, <em className="not-italic font-normal">{firstName}</em>
        </h1>
        <p className="text-[13px] text-ink-3 mt-1">
          Financial overview for <strong>{monthLabel(month, year)}</strong>
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <SummaryCard
          label="Total income"
          value={formatCurrency(s?.income ?? 0, user?.currency)}
          delta={s?.incomeDelta ?? null}
          accent="text-fgreen"
          icon="ti-trending-up"
        />
        <SummaryCard
          label="Total expenses"
          value={formatCurrency(s?.expenses ?? 0, user?.currency)}
          delta={s?.expensesDelta ?? null}
          accent="text-fred"
          icon="ti-trending-down"
        />
        <SummaryCard
          label="Net balance"
          value={formatCurrency(s?.balance ?? 0, user?.currency)}
          delta={s?.balanceDelta ?? null}
          accent="text-fblue"
          icon="ti-wallet"
        />
        <SummaryCard
          label="Budget used"
          value={s?.budgetPct !== null && s?.budgetPct !== undefined ? `${s.budgetPct}%` : "—"}
          deltaLabel={s?.budgetRemaining
            ? `${formatCurrency(s.budgetRemaining, user?.currency)} remaining`
            : undefined}
          accent="text-famber"
          icon="ti-target"
        >
          {s?.budgetPct !== null && s?.budgetPct !== undefined && (
            <div className="h-[3px] bg-cream-3 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-famber transition-all"
                style={{ width: `${Math.min(s.budgetPct, 100)}%` }}
              />
            </div>
          )}
        </SummaryCard>
      </div>

      {/* Chart + Historical */}
      <div className="grid grid-cols-[1fr_270px] gap-4 mb-4">
        {/* Bar chart panel */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="panel-title">Monthly overview</h2>
            <div className="flex gap-1">
              {[6, 12].map((n) => (
                <button
                  key={n}
                  onClick={() => setTrendRange(n)}
                  className={`text-[10px] px-2.5 py-1 rounded-[2px] border transition-all font-sans
                    ${trendRange === n
                      ? "bg-ink text-cream border-ink"
                      : "text-ink-3 border-transparent hover:border-border"}`}
                >
                  {n}M
                </button>
              ))}
            </div>
          </div>
          {trend?.trend?.length ? (
            <OverviewBarChart data={trend.trend} height={140} />
          ) : (
            <EmptyState icon="ti-chart-bar" title="No data yet" body="Add transactions to see your monthly overview" />
          )}
          <div className="flex gap-3 mt-3">
            {[["#cce4d6", "Income"], ["#f0d0ce", "Expenses"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-ink-3">
                <div className="w-2 h-2 rounded-[2px]" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Historical panel */}
        <div className="card p-5">
          <h2 className="panel-title mb-4">Historical</h2>
          {trend?.historical ? (
            <>
              {/* Mini spark */}
              <div className="flex items-end gap-1 h-7 mb-3">
                {trend.trend.map((r, i) => {
                  const max = Math.max(...trend.trend.map((x) => x.expenses), 1);
                  const h   = Math.round((r.expenses / max) * 26);
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-[1px]"
                      style={{
                        height:     Math.max(h, 2),
                        background: i === trend.trend.length - 1 ? "#f0d0ce" : "#e2ddd3",
                      }}
                    />
                  );
                })}
              </div>
              <div className="divide-y divide-border">
                {[
                  { k: "Best month",  v: `${trend.historical.bestMonth.label} ${trend.historical.bestMonth.year}`,  color: "text-fgreen" },
                  { k: "Worst month", v: `${trend.historical.worstMonth.label} ${trend.historical.worstMonth.year}`, color: "text-fred"   },
                  { k: "Avg spending", v: formatCurrency(trend.historical.avgSpend, user?.currency), color: "" },
                  { k: "Avg savings",  v: formatCurrency(trend.historical.avgSavings, user?.currency), color: "text-fgreen" },
                  { k: "Saving streak", v: `${trend.historical.savingStreak} months`, color: "" },
                ].map(({ k, v, color }) => (
                  <div key={k} className="flex justify-between py-2">
                    <span className="text-[11px] text-ink-3">{k}</span>
                    <span className={`num text-[13px] font-bold text-ink ${color}`}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon="ti-history" title="No history yet" />
          )}
        </div>
      </div>

      {/* Bottom row: Category + Recent Tx + AI Insights */}
      <div className="grid grid-cols-[210px_1fr_210px] gap-4">
        {/* Category donut */}
        <div className="card p-5">
          <h2 className="panel-title mb-3">By category</h2>
          <CategoryDonutChart data={summary?.categoryBreakdown ?? []} />
        </div>

        {/* Recent transactions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="panel-title">Recent transactions</h2>
            <button
              onClick={() => navigate("/transactions")}
              className="text-[11px] text-fblue hover:underline font-medium"
            >
              View all →
            </button>
          </div>

          {summary?.recentTransactions?.length ? (
            <div className="divide-y divide-border">
              {summary.recentTransactions.map((tx) => {
                const isInc = tx.type === "INCOME";
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-2.5">
                    <div
                      className="w-8 h-8 rounded-[3px] flex items-center justify-center text-[13px] flex-shrink-0"
                      style={{
                        background: isInc ? "#eaf3ed" : "#fcecea",
                        color:      tx.category?.color || "#7a7669",
                      }}
                    >
                      <i className={tx.category?.icon || "ti-circle"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-ink truncate">
                        {tx.description}
                      </div>
                      <div className="text-[10px] text-ink-4">
                        {formatShortDate(tx.date)} · {tx.category?.name || "General"}
                      </div>
                    </div>
                    <div
                      className={`num text-[14px] font-bold whitespace-nowrap
                        ${isInc ? "text-fgreen" : "text-fred"}`}
                    >
                      {isInc ? "+" : "−"}{formatCurrency(tx.amount, user?.currency)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="ti-receipt-off"
              title="No transactions yet"
              body="Add your first transaction to get started"
            />
          )}
        </div>

        {/* AI Insights */}
        <div className="card p-5 bg-ink border-ink">
          <div className="flex items-center gap-2 mb-4">
            <i className="ti-sparkles text-[16px]" style={{ color: "#e8c87a" }} />
            <span className="font-serif text-[15px] font-semibold" style={{ color: "#f5f2ec" }}>
              Insights
            </span>
            <span
              className="ml-auto text-[10px] px-2 py-0.5 rounded-[2px] tracking-[.04em] font-medium"
              style={{ background: "#1a3d28", color: "#7ec89a" }}
            >
              LIVE
            </span>
          </div>

          {insights.map((ins, i) => {
            const borderColor =
              ins.type === "warn" ? "#c8a842" :
              ins.type === "good" ? "#1a6e3c" : "#4a80c4";
            const titleColor =
              ins.type === "warn" ? "#e8c87a" :
              ins.type === "good" ? "#7ec89a" : "#8ab4e8";
            const bgColor =
              ins.type === "warn" ? "rgba(200,168,66,.08)" :
              ins.type === "good" ? "rgba(26,110,60,.12)"  : "rgba(74,128,196,.1)";
            return (
              <div
                key={i}
                className="mb-2 last:mb-0 pl-3 pr-2 py-2 rounded-[0px] border-l-2"
                style={{ borderColor, background: bgColor }}
              >
                <div className="text-[11px] font-medium mb-0.5" style={{ color: titleColor }}>
                  {ins.title}
                </div>
                <div className="text-[11px] leading-relaxed" style={{ color: "#9a9488" }}>
                  {ins.body}
                </div>
              </div>
            );
          })}

          <button
            onClick={() => navigate("/analytics")}
            className="w-full mt-3 py-2 text-[11px] font-sans rounded-[3px] border transition-colors hover:text-cream"
            style={{ background: "transparent", color: "#9a9488", borderColor: "#2e2c28" }}
          >
            View full analytics →
          </button>
        </div>
      </div>
    </div>
  );
}
