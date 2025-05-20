import { Router } from "express";

import { 
    createBlogPost,
    getAllBlogPosts,
    getBlogPostById,
    approveBlogPost,
    deleteBlogPost,
    getUserBlogPosts,
    getApprovedBlogPosts,
    updateBlogPost
 } from "../controllers/blog.controller.js";


import { verifyAdminJWT } from "../middlewares/adminAuth.middleware.js";
import { verifyJWT } from "../middlewares/userAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const blogRouter = Router();
blogRouter.route("/")
    .get(getApprovedBlogPosts)
    .post(verifyJWT, upload.array("images", 10), createBlogPost);

blogRouter.route("/user")
    .get(verifyJWT, getUserBlogPosts);

blogRouter.route("/user/:id")
    .get(getBlogPostById)
    .delete(verifyJWT, deleteBlogPost);


blogRouter.route("/update/:id")
    .put(verifyJWT, updateBlogPost);



blogRouter.route("/admin")
    .get(verifyAdminJWT, getAllBlogPosts);

blogRouter.route("/admin/:id")
    .put(verifyAdminJWT, approveBlogPost)
    .delete(verifyAdminJWT, deleteBlogPost);







export default blogRouter;