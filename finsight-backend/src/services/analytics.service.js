import prisma from "../utils/prisma.js";

/* ─── Helpers ────────────────────────────────────────────── */
function monthBounds(year, month) {
  return {
    from: new Date(year, month - 1, 1),
    to:   new Date(year, month,     1),
  };
}

function prevMonth(year, month) {
  return month === 1
    ? { year: year - 1, month: 12 }
    : { year, month: month - 1 };
}

async function totals(userId, from, to) {
  const rows = await prisma.transaction.groupBy({
    by:    ["type"],
    where: { userId, date: { gte: from, lt: to } },
    _sum:  { amount: true },
  });
  const income   = Number(rows.find((r) => r.type === "INCOME")?._sum?.amount  ?? 0);
  const expenses = Number(rows.find((r) => r.type === "EXPENSE")?._sum?.amount ?? 0);
  return { income, expenses, savings: income - expenses };
}

function delta(curr, prev) {
  if (prev === 0) return null;
  return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
}

function savingStreak(arr) {
  let streak = 0;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] > 0) streak++;
    else break;
  }
  return streak;
}

async function categoryBreakdownForPeriod(userId, from, to, totalExpenses) {
  const catAgg = await prisma.transaction.groupBy({
    by:      ["categoryId"],
    where:   { userId, type: "EXPENSE", date: { gte: from, lt: to } },
    _sum:    { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  if (catAgg.length === 0) return [];

  const catIds = catAgg.map((c) => c.categoryId);
  const cats = await prisma.category.findMany({
    where:  { id: { in: catIds } },
    select: { id: true, name: true, icon: true, color: true },
  });
  const catMap = new Map(cats.map((c) => [c.id, c]));

  return catAgg.map((c) => ({
    category: catMap.get(c.categoryId) ?? null,
    amount:   Number(c._sum.amount ?? 0),
    pct:
      totalExpenses > 0
        ? parseFloat(((Number(c._sum.amount ?? 0) / totalExpenses) * 100).toFixed(1))
        : 0,
  }));
}

/* ─── getDashboardSummary ────────────────────────────────── */
export async function getDashboardSummary(userId, month, year) {
  const { from, to }         = monthBounds(year, month);
  const pm                   = prevMonth(year, month);
  const { from: pf, to: pt } = monthBounds(pm.year, pm.month);

  const [curr, prev] = await Promise.all([
    totals(userId, from, to),
    totals(userId, pf,   pt),
  ]);

  /* Budget utilisation */
  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
  });
  const spendAgg = await prisma.transaction.groupBy({
    by:    ["categoryId"],
    where: { userId, type: "EXPENSE", date: { gte: from, lt: to } },
    _sum:  { amount: true },
  });
  const spendMap = new Map(
    spendAgg.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)])
  );
  const totalBudget   = budgets.reduce((s, b) => s + Number(b.amount), 0);
  const budgetedSpend = budgets.reduce(
    (s, b) => s + (spendMap.get(b.categoryId) ?? 0),
    0
  );
  const budgetPct =
    totalBudget > 0 ? Math.round((budgetedSpend / totalBudget) * 100) : null;

  /* Category breakdown */
  const categoryBreakdown = await categoryBreakdownForPeriod(
    userId, from, to, curr.expenses
  );

  /* Recent 5 transactions */
  const recentTransactions = await prisma.transaction.findMany({
    where:   { userId, date: { gte: from, lt: to } },
    orderBy: { date: "desc" },
    take:    5,
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
  });

  return {
    period: { month, year },
    summary: {
      income:          curr.income,
      incomeDelta:     delta(curr.income,   prev.income),
      expenses:        curr.expenses,
      expensesDelta:   delta(curr.expenses, prev.expenses),
      balance:         curr.savings,
      balanceDelta:    delta(curr.savings,  prev.savings),
      budgetPct,
      totalBudget,
      budgetRemaining: totalBudget - budgetedSpend,
    },
    categoryBreakdown,
    recentTransactions,
  };
}

/* ─── getMonthlyTrend ────────────────────────────────────── */
export async function getMonthlyTrend(userId, numMonths = 6) {
  const now     = new Date();
  const results = [];

  for (let i = numMonths - 1; i >= 0; i--) {
    const d        = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month    = d.getMonth() + 1;
    const year     = d.getFullYear();
    const { from, to } = monthBounds(year, month);
    const t        = await totals(userId, from, to);
    results.push({
      month,
      year,
      label:    d.toLocaleString("default", { month: "short" }),
      income:   t.income,
      expenses: t.expenses,
      savings:  t.savings,
    });
  }

  if (results.length === 0) {
    return { trend: [], historical: null };
  }

  const best  = results.reduce((a, b) => (a.savings  > b.savings  ? a : b));
  const worst = results.reduce((a, b) => (a.expenses > b.expenses ? a : b));
  const avgSpend   = results.reduce((s, r) => s + r.expenses, 0) / results.length;
  const avgSavings = results.reduce((s, r) => s + r.savings,  0) / results.length;

  return {
    trend: results,
    historical: {
      bestMonth:    { label: best.label,  year: best.year,  savings: best.savings  },
      worstMonth:   { label: worst.label, year: worst.year, expenses: worst.expenses },
      avgSpend:     parseFloat(avgSpend.toFixed(2)),
      avgSavings:   parseFloat(avgSavings.toFixed(2)),
      savingStreak: savingStreak(results.map((r) => r.savings)),
    },
  };
}

/* ─── getInsights ────────────────────────────────────────── */
export async function getInsights(userId) {
  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  const { from, to }         = monthBounds(year, month);
  const pm                   = prevMonth(year, month);
  const { from: pf, to: pt } = monthBounds(pm.year, pm.month);

  const [currCats, prevCats, budgets, curr] = await Promise.all([
    prisma.transaction.groupBy({
      by:      ["categoryId"],
      where:   { userId, type: "EXPENSE", date: { gte: from, lt: to } },
      _sum:    { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.transaction.groupBy({
      by:    ["categoryId"],
      where: { userId, type: "EXPENSE", date: { gte: pf, lt: pt } },
      _sum:  { amount: true },
    }),
    prisma.budget.findMany({ where: { userId, month, year } }),
    totals(userId, from, to),
  ]);

  const spendNow  = new Map(
    currCats.map((c) => [c.categoryId, Number(c._sum.amount ?? 0)])
  );
  const spendPrev = new Map(
    prevCats.map((c) => [c.categoryId, Number(c._sum.amount ?? 0)])
  );

  const catIds = [
    ...new Set([
      ...spendNow.keys(),
      ...spendPrev.keys(),
      ...budgets.map((b) => b.categoryId),
    ]),
  ];
  const cats = await prisma.category.findMany({
    where:  { id: { in: catIds } },
    select: { id: true, name: true, icon: true, color: true },
  });
  const catMap = new Map(cats.map((c) => [c.id, c]));

  const list = [];

  /* 1 — Top category vs last month */
  if (currCats[0]) {
    const topId   = currCats[0].categoryId;
    const topAmt  = spendNow.get(topId)  ?? 0;
    const prevAmt = spendPrev.get(topId) ?? 0;
    if (prevAmt > 0 && topAmt > prevAmt) {
      const pct = Math.round(((topAmt - prevAmt) / prevAmt) * 100);
      list.push({
        type:  "warn",
        title: `${catMap.get(topId)?.name ?? "Top category"} up ${pct}% this month`,
        body:  `₹${topAmt.toLocaleString("en-IN")} spent vs ₹${prevAmt.toLocaleString("en-IN")} last month.`,
      });
    }
  }

  /* 2 — Budget warnings */
  for (const b of budgets) {
    const spent   = spendNow.get(b.categoryId) ?? 0;
    const limit   = Number(b.amount);
    const pct     = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const catName = catMap.get(b.categoryId)?.name ?? "Category";

    if (pct >= 90) {
      list.push({
        type:  "warn",
        title: `${catName} budget at ${pct}%`,
        body:  `₹${spent.toLocaleString("en-IN")} of ₹${limit.toLocaleString("en-IN")} limit used.`,
      });
    } else if (pct >= 70) {
      list.push({
        type:  "info",
        title: `${catName} at ${pct}% of budget`,
        body:  `₹${(limit - spent).toLocaleString("en-IN")} remaining this month.`,
      });
    }
  }

  /* 3 — Monthly savings */
  if (curr.savings > 0) {
    list.push({
      type:  "good",
      title: `₹${curr.savings.toLocaleString("en-IN")} saved this month`,
      body:  "You're in the green — great financial discipline.",
    });
  } else if (curr.savings < 0) {
    list.push({
      type:  "warn",
      title: "Spending exceeds income this month",
      body:  `You're ₹${Math.abs(curr.savings).toLocaleString("en-IN")} over your income.`,
    });
  }

  /* 4 — Fallback */
  if (list.length === 0) {
    list.push({
      type:  "info",
      title: "No insights yet",
      body:  "Add transactions and set budgets to get personalised insights.",
    });
  }

  return list;
}

/* ─── getYearlySummary ───────────────────────────────────── */
export async function getYearlySummary(userId, year) {
  const from = new Date(year, 0,  1);
  const to   = new Date(year, 12, 1);
  const t    = await totals(userId, from, to);

  const categoryBreakdown = await categoryBreakdownForPeriod(
    userId, from, to, t.expenses
  );

  return {
    year,
    income:      t.income,
    expenses:    t.expenses,
    savings:     t.savings,
    savingsRate:
      t.income > 0
        ? parseFloat(((t.savings / t.income) * 100).toFixed(1))
        : 0,
    categoryBreakdown,
  };
}
