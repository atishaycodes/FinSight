import prisma from "../utils/prisma.js";

const TX_INCLUDE = {
  category: { select: { id: true, name: true, icon: true, color: true } },
};

export async function listTransactions(userId, filters = {}) {
  const { type, categoryId, from, to, search, page = 1, limit = 30 } = filters;

  const where = { userId };
  if (type)       where.type = type.toUpperCase();
  if (categoryId) where.categoryId = categoryId;
  if (search)     where.description = { contains: search };
  if (from || to) {
    where.date = {
      ...(from && { gte: new Date(from) }),
      ...(to   && { lte: new Date(to)   }),
    };
  }

  const [total, items] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include:  TX_INCLUDE,
      orderBy:  { date: "desc" },
      skip:     (page - 1) * limit,
      take:     limit,
    }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getTransaction(userId, id) {
  const tx = await prisma.transaction.findFirst({
    where:   { id, userId },
    include: TX_INCLUDE,
  });
  if (!tx) throw new Error("NOT_FOUND");
  return tx;
}

export async function createTransaction(userId, input) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new Error("INVALID_CATEGORY");

  return prisma.transaction.create({
    data: {
      userId,
      categoryId:  input.categoryId,
      type:        input.type.toUpperCase(),
      amount:      parseFloat(input.amount),
      description: input.description,
      date:        new Date(input.date),
    },
    include: TX_INCLUDE,
  });
}

export async function updateTransaction(userId, id, input) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("NOT_FOUND");

  const data = {};
  if (input.categoryId  !== undefined) data.categoryId  = input.categoryId;
  if (input.type        !== undefined) data.type        = input.type.toUpperCase();
  if (input.amount      !== undefined) data.amount      = parseFloat(input.amount);
  if (input.description !== undefined) data.description = input.description;
  if (input.date        !== undefined) data.date        = new Date(input.date);

  return prisma.transaction.update({ where: { id }, data, include: TX_INCLUDE });
}

export async function deleteTransaction(userId, id) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("NOT_FOUND");
  await prisma.transaction.delete({ where: { id } });
}
