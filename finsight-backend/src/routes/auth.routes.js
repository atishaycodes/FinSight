import { Router } from "express";
import { body } from "express-validator";
import * as ctrl from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  ctrl.register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  ctrl.login
);

// Google OAuth
router.post(
  "/google",
  [
    body("googleId").notEmpty().withMessage("googleId is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("name").trim().notEmpty().withMessage("name is required"),
  ],
  validate,
  ctrl.googleCallback
);

router.get("/me", authenticate, ctrl.me);

router.patch(
  "/profile",
  authenticate,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be blank"),
    body("currency").optional().isLength({ min: 3, max: 3 }).withMessage("Currency must be a 3-letter code"),
  ],
  validate,
  ctrl.updateProfile
);

router.patch(
  "/change-password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
  ],
  validate,
  ctrl.changePassword
);

router.delete("/account", authenticate, ctrl.deleteAccount);

export default router;
