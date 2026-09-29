import prisma from "../utils/prisma.js";

const BUDGET_INCLUDE = {
  category: { select: { id: true, name: true, icon: true, color: true } },
};

export async function listBudgets(userId, month, year) {
  const from = new Date(year, month - 1, 1);
  const to   = new Date(year, month,     1);

  const [budgets, spending] = await Promise.all([
    prisma.budget.findMany({
      where:   { userId, month, year },
      include: BUDGET_INCLUDE,
      orderBy: { category: { name: "asc" } },
    }),
    prisma.transaction.groupBy({
      by:    ["categoryId"],
      where: { userId, type: "EXPENSE", date: { gte: from, lt: to } },
      _sum:  { amount: true },
    }),
  ]);

  const spendMap = new Map(
    spending.map((s) => [
      s.categoryId,
      Number(s._sum.amount ?? 0),
    ])
  );

  return budgets.map((b) => {
    const spent     = spendMap.get(b.categoryId) ?? 0;
    const limit     = Number(b.amount);
    const remaining = limit - spent;
    const pct       = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    return { ...b, spent, remaining, pct };
  });
}

export async function createBudget(userId, input) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new Error("INVALID_CATEGORY");

  return prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId: input.categoryId,
        month:      input.month,
        year:       input.year,
      },
    },
    update: { amount: parseFloat(input.amount) },
    create: {
      userId,
      categoryId: input.categoryId,
      amount:     parseFloat(input.amount),
      month:      input.month,
      year:       input.year,
    },
    include: BUDGET_INCLUDE,
  });
}

export async function updateBudget(userId, id, amount) {
  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("NOT_FOUND");
  return prisma.budget.update({
    where:   { id },
    data:    { amount: parseFloat(amount) },
    include: BUDGET_INCLUDE,
  });
}

export async function deleteBudget(userId, id) {
  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("NOT_FOUND");
  await prisma.budget.delete({ where: { id } });
}
