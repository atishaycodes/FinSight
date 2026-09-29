import * as budgetService from "../services/budget.service.js";
import { ok, created, noContent, notFound, serverError } from "../utils/response.js";

export async function list(req, res) {
  try {
    const now   = new Date();
    const month = parseInt(String(req.query.month ?? now.getMonth() + 1));
    const year  = parseInt(String(req.query.year  ?? now.getFullYear()));
    const budgets = await budgetService.listBudgets(req.user.userId, month, year);
    return ok(res, budgets);
  } catch (e) {
    console.error(e);
    return serverError(res);
  }
}

export async function create(req, res) {
  try {
    const { categoryId, amount, month, year } = req.body;
    const budget = await budgetService.createBudget(req.user.userId, {
      categoryId,
      amount: parseFloat(String(amount)),
      month:  parseInt(String(month)),
      year:   parseInt(String(year)),
    });
    return created(res, budget);
  } catch (e) {
    if (e.message === "INVALID_CATEGORY")
      return notFound(res, "Category not found");
    console.error(e);
    return serverError(res);
  }
}

export async function update(req, res) {
  try {
    const budget = await budgetService.updateBudget(
      req.user.userId,
      req.params.id,
      parseFloat(String(req.body.amount))
    );
    return ok(res, budget);
  } catch (e) {
    if (e.message === "NOT_FOUND")
      return notFound(res, "Budget not found");
    return serverError(res);
  }
}

export async function remove(req, res) {
  try {
    await budgetService.deleteBudget(req.user.userId, req.params.id);
    return noContent(res);
  } catch (e) {
    if (e.message === "NOT_FOUND")
      return notFound(res, "Budget not found");
    return serverError(res);
  }
}
