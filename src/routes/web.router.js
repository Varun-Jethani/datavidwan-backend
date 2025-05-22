import { Router } from "express";

import {
    getAllServices,
    getAllCourses,
    getAllImages,
    addService,
    addCourse,
    addImages,
    updateService,
    updateCourse,
    updateImages,
    deleteService,
    deleteCourse,
    deleteImages
} from "../controllers/web.controller.js";

import { verifyAdminJWT } from "../middlewares/adminAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const webRouter = Router();

webRouter.route("/services").get(getAllServices)
webRouter.route("/courses").get(getAllCourses)
webRouter.route("/images").get(getAllImages)
webRouter.use(verifyAdminJWT);
webRouter.route("/services").post(addService).put(updateService)
webRouter.route("/service/:id").delete(deleteService);
webRouter.route("/courses").post(upload.single("coverImage"), addCourse).put(upload.single("coverImage"), updateCourse)
webRouter.route("/course/:id").delete(deleteCourse);
webRouter.route("/images").post(upload.array("images",10), addImages).put(updateImages)
webRouter.route("/image/:id").delete(deleteImages);

export default webRouter;
