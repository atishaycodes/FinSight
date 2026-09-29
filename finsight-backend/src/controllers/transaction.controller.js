import * as txService from "../services/transaction.service.js";
import {
  ok, created, noContent, badRequest, notFound, serverError,
} from "../utils/response.js";

export async function list(req, res) {
  try {
    const {
      page, limit, type, categoryId, from, to, search,
    } = req.query;

    const result = await txService.listTransactions(req.user.userId, {
      page:       page       ? parseInt(page)  : undefined,
      limit:      limit      ? parseInt(limit) : undefined,
      type:       type       ? type.toUpperCase() : undefined,
      categoryId: categoryId || undefined,
      from:       from       || undefined,
      to:         to         || undefined,
      search:     search     || undefined,
    });
    return ok(res, result);
  } catch (e) {
    console.error(e);
    return serverError(res);
  }
}

export async function getOne(req, res) {
  try {
    const tx = await txService.getTransaction(req.user.userId, req.params.id);
    return ok(res, tx);
  } catch (e) {
    if (e.message === "NOT_FOUND")
      return notFound(res, "Transaction not found");
    return serverError(res);
  }
}

export async function create(req, res) {
  try {
    const { type, amount, description, categoryId, date } = req.body;
    const tx = await txService.createTransaction(req.user.userId, {
      type:        type.toUpperCase(),
      amount:      parseFloat(String(amount)),
      description,
      categoryId,
      date,
    });
    return created(res, tx);
  } catch (e) {
    if (e.message === "INVALID_CATEGORY")
      return badRequest(res, "Invalid category ID");
    console.error(e);
    return serverError(res);
  }
}

export async function update(req, res) {
  try {
    const { type, amount, description, categoryId, date } = req.body;
    const tx = await txService.updateTransaction(req.user.userId, req.params.id, {
      ...(type        && { type: type.toUpperCase() }),
      ...(amount      !== undefined && { amount: parseFloat(String(amount)) }),
      ...(description !== undefined && { description }),
      ...(categoryId  !== undefined && { categoryId }),
      ...(date        !== undefined && { date }),
    });
    return ok(res, tx);
  } catch (e) {
    if (e.message === "NOT_FOUND")
      return notFound(res, "Transaction not found");
    return serverError(res);
  }
}

export async function remove(req, res) {
  try {
    await txService.deleteTransaction(req.user.userId, req.params.id);
    return noContent(res);
  } catch (e) {
    if (e.message === "NOT_FOUND")
      return notFound(res, "Transaction not found");
    return serverError(res);
  }
}
