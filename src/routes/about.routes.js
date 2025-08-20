import { Router } from "express";

import { addTestimonial, 
    updateTestimonial,
    deleteTestimonial,
    getAllTestimonials,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    getAllTeamMembers
 } from "../controllers/about.controller.js";

import { verifyAdminJWT } from "../middlewares/adminAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const aboutRouter = Router();
aboutRouter.route("/testimonials").get(getAllTestimonials);

aboutRouter.route("/testimonials/add").post(verifyAdminJWT, upload.single("image"), addTestimonial);
aboutRouter.route("/testimonials/update/:testimonialId").put(verifyAdminJWT, upload.single("image"), updateTestimonial);
aboutRouter.route("/testimonials/delete/:testimonialId").delete(verifyAdminJWT, deleteTestimonial);

aboutRouter.route("/team").get(getAllTeamMembers);
aboutRouter.route("/team/add").post(verifyAdminJWT, upload.single("image"), addTeamMember);
aboutRouter.route("/team/update/:teamMemberId").put(verifyAdminJWT, upload.single("image"), updateTeamMember);
aboutRouter.route("/team/delete/:teamMemberId").delete(verifyAdminJWT, deleteTeamMember);

export default aboutRouter;