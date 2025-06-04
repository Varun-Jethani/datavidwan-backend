import { createConsult, getAllConsults, deleteConsult } from "../controllers/consult.controller.js";

import { Router } from "express";
import { verifyAdminJWT } from "../middlewares/adminAuth.middleware.js";

const consultRouter = Router();

consultRouter.post("/", createConsult);
consultRouter.get("/", verifyAdminJWT, getAllConsults);
consultRouter.delete("/:id", verifyAdminJWT, deleteConsult);

export default consultRouter;

