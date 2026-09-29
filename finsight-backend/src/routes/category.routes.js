import { Router } from "express";
import * as ctrl from "../controllers/category.controller.js";

const router = Router();
router.get("/", ctrl.list);

export default router;
