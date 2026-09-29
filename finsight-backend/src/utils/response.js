export function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function created(res, data) {
  return ok(res, data, 201);
}

export function noContent(res) {
  return res.status(204).send();
}

export function badRequest(res, message, errors) {
  return res.status(400).json({ success: false, message, errors });
}

export function unauthorized(res, message = "Unauthorized") {
  return res.status(401).json({ success: false, message });
}

export function forbidden(res, message = "Forbidden") {
  return res.status(403).json({ success: false, message });
}

export function notFound(res, message = "Not found") {
  return res.status(404).json({ success: false, message });
}

export function serverError(res, message = "Internal server error") {
  return res.status(500).json({ success: false, message });
}
