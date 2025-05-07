import { Router } from "express";

import {
    registerAdmin, loginAdmin, logoutAdmin, getAdminProfile, updateAdminProfile, validateToken
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/adminAuth.middleware.js";


const adminRouter = Router();

adminRouter.route("/register").post(registerAdmin);
adminRouter.route("/login").post(loginAdmin);
adminRouter.use(verifyJWT);
adminRouter.route("/logout").post(logoutAdmin);
adminRouter.route("/profile").get(getAdminProfile).put(updateAdminProfile);
adminRouter.route("/validate").get(validateToken);


export default adminRouter;