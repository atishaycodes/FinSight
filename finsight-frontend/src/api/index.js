import api from "./client.js";

/* ── helpers ─────────────────────────────────────────── */
function data(res) {
  return res.data.data;
}

/* ── Auth ────────────────────────────────────────────── */
export const authApi = {
  register: (body) =>
    api.post("/auth/register", body).then(data),

  login: (body) =>
    api.post("/auth/login", body).then(data),

  google: (body) =>
    api.post("/auth/google", body).then(data),

  me: () =>
    api.get("/auth/me").then(data),

  updateProfile: (body) =>
    api.patch("/auth/profile", body).then(data),

  changePassword: (body) =>
    api.patch("/auth/change-password", body).then(data),

  deleteAccount: () =>
    api.delete("/auth/account").then(data),
};

/* ── Categories ──────────────────────────────────────── */
export const categoriesApi = {
  list: () =>
    api.get("/categories").then(data),
};

/* ── Transactions ────────────────────────────────────── */
export const transactionsApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page)       params.set("page",       String(filters.page));
    if (filters.limit)      params.set("limit",      String(filters.limit));
    if (filters.type)       params.set("type",       filters.type);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.from)       params.set("from",       filters.from);
    if (filters.to)         params.set("to",         filters.to);
    if (filters.search)     params.set("search",     filters.search);
    return api
      .get(`/transactions?${params.toString()}`)
      .then(data);
  },

  get: (id) =>
    api.get(`/transactions/${id}`).then(data),

  create: (body) =>
    api.post("/transactions", body).then(data),

  update: (id, body) =>
    api.patch(`/transactions/${id}`, body).then(data),

  delete: (id) =>
    api.delete(`/transactions/${id}`),
};

/* ── Budgets ─────────────────────────────────────────── */
export const budgetsApi = {
  list: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.set("month", String(month));
    if (year)  params.set("year",  String(year));
    return api.get(`/budgets?${params.toString()}`).then(data);
  },

  create: (body) =>
    api.post("/budgets", body).then(data),

  update: (id, amount) =>
    api.patch(`/budgets/${id}`, { amount }).then(data),

  delete: (id) =>
    api.delete(`/budgets/${id}`),
};

/* ── Analytics ───────────────────────────────────────── */
export const analyticsApi = {
  dashboard: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.set("month", String(month));
    if (year)  params.set("year",  String(year));
    return api
      .get(`/analytics/dashboard?${params.toString()}`)
      .then(data);
  },

  trend: (months = 6) =>
    api
      .get(`/analytics/trend?months=${months}`)
      .then(data),

  insights: () =>
    api.get("/analytics/insights").then(data),

  yearly: (year) => {
    const params = year ? `?year=${year}` : "";
    return api
      .get(`/analytics/yearly${params}`)
      .then(data);
  },
};
