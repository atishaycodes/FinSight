import { validationResult } from "express-validator";
import { badRequest } from "../utils/response.js";

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return badRequest(res, "Validation failed", errors.array());
  }
  return next();
}
