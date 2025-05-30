import { Router } from "express";

import { postContact,getContacts,deleteContact } from "../controllers/contact.controller.js";
import { verifyAdminJWT } from "../middlewares/adminAuth.middleware.js";


const contactRouter = Router();
contactRouter.post("/", postContact);
contactRouter.get("/", verifyAdminJWT, getContacts);
contactRouter.delete("/:id", verifyAdminJWT, deleteContact);

export default contactRouter;