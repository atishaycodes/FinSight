import { verifyToken } from "../utils/jwt.js";
import { unauthorized } from "../utils/response.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized(res);
  }
  const token = header.slice(7);
  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return unauthorized(res, "Token expired or invalid");
  }
}
