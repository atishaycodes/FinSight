import * as authService from "../services/auth.service.js";
import {
  ok, created, badRequest, unauthorized, serverError,
} from "../utils/response.js";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser(email, name, password);
    return created(res, result);
  } catch (e) {
    if (e.message === "EMAIL_TAKEN") return badRequest(res, "Email already in use");
    console.error(e);
    return serverError(res);
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return ok(res, result);
  } catch (e) {
    if (e.message === "INVALID_CREDENTIALS")
      return unauthorized(res, "Invalid email or password");
    console.error(e);
    return serverError(res);
  }
}

export async function googleCallback(req, res) {
  try {
    const { googleId, email, name } = req.body;
    const result = await authService.googleUpsertUser(googleId, email, name);
    return ok(res, result);
  } catch (e) {
    console.error(e);
    return serverError(res);
  }
}

export async function me(req, res) {
  try {
    const user = await authService.getUser(req.user.userId);
    return ok(res, user);
  } catch (e) {
    if (e.message === "NOT_FOUND") return unauthorized(res);
    return serverError(res);
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, currency } = req.body;
    const user = await authService.updateProfile(req.user.userId, { name, currency });
    return ok(res, user);
  } catch (e) {
    return serverError(res);
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    return ok(res, { message: "Password updated successfully" });
  } catch (e) {
    if (e.message === "INVALID_CREDENTIALS")
      return badRequest(res, "Current password is incorrect");
    if (e.message === "NO_PASSWORD")
      return badRequest(res, "This account uses Google sign-in — no password to change");
    return serverError(res);
  }
}

export async function deleteAccount(req, res) {
  try {
    await authService.deleteAccount(req.user.userId);
    return ok(res, { message: "Account deleted" });
  } catch (e) {
    return serverError(res);
  }
}
