import { Router } from "express";

import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  updateAdminProfile,
  validateToken,
} from "../controllers/admin.controller.js";

import { verifyAdminJWT } from "../middlewares/adminAuth.middleware.js";

const adminRouter = Router();

/* ---------- PUBLIC ROUTES ---------- */
adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);

/* 🔴 LOGOUT MUST BE PUBLIC */
adminRouter.post("/logout", logoutAdmin);

/* ---------- PROTECTED ROUTES ---------- */
adminRouter.use(verifyAdminJWT);

adminRouter.get("/profile", getAdminProfile);
adminRouter.put("/profile", updateAdminProfile);
adminRouter.get("/validate", validateToken);

export default adminRouter;
