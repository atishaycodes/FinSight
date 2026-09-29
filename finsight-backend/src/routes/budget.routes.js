import { Router } from "express";
import { body, query } from "express-validator";
import * as ctrl from "../controllers/budget.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  [
    query("month").optional().isInt({ min: 1, max: 12 }),
    query("year").optional().isInt({ min: 2000 }),
  ],
  validate,
  ctrl.list
);

router.post(
  "/",
  [
    body("categoryId").notEmpty().withMessage("categoryId is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("amount must be a positive number"),
    body("month").isInt({ min: 1, max: 12 }).withMessage("month must be 1-12"),
    body("year").isInt({ min: 2000 }).withMessage("year must be 2000 or later"),
  ],
  validate,
  ctrl.create
);

router.patch(
  "/:id",
  [body("amount").isFloat({ gt: 0 }).withMessage("amount must be a positive number")],
  validate,
  ctrl.update
);

router.delete("/:id", ctrl.remove);

export default router;
