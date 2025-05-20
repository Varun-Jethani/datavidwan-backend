import { Router } from "express";

import { addTestimonial, 
    updateTestimonial,
    deleteTestimonial,
    getAllTestimonials
 } from "../controllers/about.controller.js";

import { verifyAdminJWT } from "../middlewares/adminAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const aboutRouter = Router();
aboutRouter.route("/testimonials").get(getAllTestimonials);

aboutRouter.route("/testimonials/add").post(verifyAdminJWT, upload.single("image"), addTestimonial);
aboutRouter.route("/testimonials/update/:testimonialId").put(verifyAdminJWT, upload.single("image"), updateTestimonial);
aboutRouter.route("/testimonials/delete/:testimonialId").delete(verifyAdminJWT, deleteTestimonial);

export default aboutRouter;