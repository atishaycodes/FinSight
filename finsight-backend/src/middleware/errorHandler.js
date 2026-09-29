export function errorHandler(err, _req, res, _next) {
  const message =
    typeof err === "string"
      ? err
      : err?.message ?? "Internal server error";

  const status = typeof err?.status === "number" ? err.status : 500;

  console.error(`[ERROR ${status}]`, message);
  if (process.env.NODE_ENV === "development" && err?.stack) {
    console.error(err.stack);
  }

  res.status(status).json({ success: false, message });
}
