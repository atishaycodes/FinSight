import { useState, useEffect, useCallback } from "react";
import { analyticsApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { SummaryCard, LoadingPage, EmptyState } from "../components/ui/index.jsx";
import OverviewBarChart from "../components/charts/OverviewBarChart.jsx";
import {
  formatCurrency, currentMonthYear, extractApiError,
} from "../utils/index.js";

export default function AnalyticsPage() {
  const { user }   = useAuth();
  const toast      = useToast();
  const { year }   = currentMonthYear();

  const [trend,    setTrend]    = useState(null);
  const [yearly,   setYearly]   = useState(null);
  const [insights, setInsights] = useState([]);
  const [months,   setMonths]   = useState(6);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, y, ins] = await Promise.all([
        analyticsApi.trend(months),
        analyticsApi.yearly(year),
        analyticsApi.insights(),
      ]);
      setTrend(t);
      setYearly(y);
      setInsights(ins);
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, [months, year, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingPage />;

  return (
    <div className="px-9 py-9 pb-12">
      <h1 className="page-title mb-7">Analytics</h1>

      {/* YTD summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-7">
        <SummaryCard
          label="YTD income"
          value={formatCurrency(yearly?.income ?? 0, user?.currency)}
          accent="text-fgreen"
          icon="ti-trending-up"
        />
        <SummaryCard
          label="YTD expenses"
          value={formatCurrency(yearly?.expenses ?? 0, user?.currency)}
          accent="text-fred"
          icon="ti-trending-down"
        />
        <SummaryCard
          label="YTD savings"
          value={formatCurrency(yearly?.savings ?? 0, user?.currency)}
          accent="text-fblue"
          icon="ti-piggy-bank"
        />
        <SummaryCard
          label="Savings rate"
          value={yearly ? `${yearly.savingsRate}%` : "—"}
          accent="text-famber"
          icon="ti-chart-pie"
        />
      </div>

      {/* Full-width trend chart */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="panel-title">Income vs expenses</h2>
          <div className="flex gap-1">
            {[6, 12].map((n) => (
              <button
                key={n}
                onClick={() => setMonths(n)}
                className={`text-[10px] px-2.5 py-1 rounded-[2px] border transition-all font-sans
                  ${months === n
                    ? "bg-ink text-cream border-ink"
                    : "text-ink-3 border-transparent hover:border-border"}`}
              >
                {n}M
              </button>
            ))}
          </div>
        </div>
        {trend?.trend?.length ? (
          <OverviewBarChart data={trend.trend} height={160} />
        ) : (
          <EmptyState icon="ti-chart-bar" title="No data yet" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Category breakdown */}
        <div className="card p-5">
          <h2 className="panel-title mb-4">Spending by category — {year}</h2>
          {yearly?.categoryBreakdown?.length ? (
            <div className="flex flex-col gap-2">
              {yearly.categoryBreakdown.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: c.category?.color ?? "#b0ab9e" }}
                  />
                  <span className="text-[12px] text-ink-3 flex-1 truncate">
                    {c.category?.name ?? "Other"}
                  </span>
                  <div className="w-24 h-1.5 bg-cream-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width:      `${c.pct}%`,
                        background: c.category?.color ?? "#b0ab9e",
                      }}
                    />
                  </div>
                  <span className="num text-[13px] font-bold text-ink min-w-[60px] text-right">
                    {formatCurrency(c.amount, user?.currency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="ti-chart-pie" title="No expense data" />
          )}
        </div>

        {/* Monthly savings + historical */}
        <div className="card p-5">
          <h2 className="panel-title mb-4">Monthly savings</h2>
          {trend?.trend?.length ? (
            <>
              {/* Savings spark bars */}
              <div className="flex items-end gap-1.5 h-16 mb-2">
                {trend.trend.map((r, i) => {
                  const max = Math.max(...trend.trend.map((x) => Math.abs(x.savings)), 1);
                  const h   = Math.round((Math.abs(r.savings) / max) * 60);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className="w-full rounded-[2px]"
                        style={{
                          height:     Math.max(h, 2),
                          background: r.savings >= 0 ? "#cce4d6" : "#f0d0ce",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mb-4">
                {trend.trend.map((r, i) => (
                  <span key={i} className="flex-1 text-center text-[10px] text-ink-4">
                    {r.label}
                  </span>
                ))}
              </div>

              {trend.historical && (
                <div className="divide-y divide-border border-t border-border">
                  {[
                    { k: "Best month",   v: `${trend.historical.bestMonth.label} ${trend.historical.bestMonth.year}`,   c: "text-fgreen" },
                    { k: "Worst month",  v: `${trend.historical.worstMonth.label} ${trend.historical.worstMonth.year}`, c: "text-fred"   },
                    { k: "Avg spend",    v: formatCurrency(trend.historical.avgSpend,   user?.currency), c: "" },
                    { k: "Avg savings",  v: formatCurrency(trend.historical.avgSavings, user?.currency), c: "text-fgreen" },
                    { k: "Saving streak", v: `${trend.historical.savingStreak} months`, c: "" },
                  ].map(({ k, v, c }) => (
                    <div key={k} className="flex justify-between py-2">
                      <span className="text-[11px] text-ink-3">{k}</span>
                      <span className={`num text-[13px] font-bold text-ink ${c}`}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState icon="ti-chart-line" title="No data yet" />
          )}
        </div>

        {/* AI Insights full list */}
        <div className="card p-5 col-span-2">
          <h2 className="panel-title mb-4">AI insights</h2>
          {insights.length === 0 ? (
            <EmptyState icon="ti-sparkles" title="No insights yet"
              body="Add transactions and budgets to get personalised insights" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {insights.map((ins, i) => {
                const colors = {
                  warn: { bg: "bg-famber-bg", border: "border-l-famber", title: "text-famber" },
                  good: { bg: "bg-fgreen-bg", border: "border-l-fgreen", title: "text-fgreen" },
                  info: { bg: "bg-fblue-bg",  border: "border-l-fblue",  title: "text-fblue"  },
                }[ins.type] || { bg: "bg-cream-2", border: "border-l-ink", title: "text-ink" };
                return (
                  <div
                    key={i}
                    className={`${colors.bg} border-l-2 ${colors.border} rounded-[2px] p-3`}
                  >
                    <div className={`text-[12px] font-medium mb-1 ${colors.title}`}>
                      {ins.title}
                    </div>
                    <div className="text-[11px] text-ink-3 leading-relaxed">{ins.body}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
