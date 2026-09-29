import * as analyticsService from "../services/analytics.service.js";
import { ok, serverError } from "../utils/response.js";

export async function dashboardSummary(req, res) {
  try {
    const now   = new Date();
    const month = parseInt(req.query.month ?? String(now.getMonth() + 1));
    const year  = parseInt(req.query.year  ?? String(now.getFullYear()));
    const data  = await analyticsService.getDashboardSummary(req.user.userId, month, year);
    return ok(res, data);
  } catch (e) {
    console.error(e);
    return serverError(res);
  }
}

export async function monthlyTrend(req, res) {
  try {
    const months = parseInt(req.query.months ?? "6");
    const data   = await analyticsService.getMonthlyTrend(req.user.userId, months);
    return ok(res, data);
  } catch (e) {
    console.error(e);
    return serverError(res);
  }
}

export async function insights(req, res) {
  try {
    const data = await analyticsService.getInsights(req.user.userId);
    return ok(res, data);
  } catch (e) {
    console.error(e);
    return serverError(res);
  }
}

export async function yearlySummary(req, res) {
  try {
    const year = parseInt(req.query.year ?? String(new Date().getFullYear()));
    const data = await analyticsService.getYearlySummary(req.user.userId, year);
    return ok(res, data);
  } catch (e) {
    console.error(e);
    return serverError(res);
  }
}
