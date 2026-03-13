import { Router } from "express";

import {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  approveBlogPost,
  deleteBlogPost,
  getUserBlogPosts,
  getApprovedBlogPosts,
  updateBlogPost,
  rejectBlogPost,
  getApprovedAdminBlogs,
  getPendingAdminBlogs,
} from "../controllers/blog.controller.js";

import { verifyAdminJWT } from "../middlewares/adminAuth.middleware.js";
import { verifyJWT } from "../middlewares/userAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const blogRouter = Router();

/* ================================
   PUBLIC / USER ROUTES
================================ */

// Create + Get approved blogs
blogRouter
  .route("/")
  .get(getApprovedBlogPosts)
  .post(
    verifyJWT,
    upload.fields([
      { name: "images", maxCount: 10 },
      { name: "pdf", maxCount: 1 },
    ]),
    createBlogPost,
  );

// Get logged-in user's blogs
blogRouter.route("/user").get(verifyJWT, getUserBlogPosts);

// Get / delete single blog (owner)
blogRouter
  .route("/user/:id")
  .get(getBlogPostById)
  .delete(verifyJWT, deleteBlogPost);

// Update blog
blogRouter.route("/update/:id").put(
  verifyJWT,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
  ]),
  updateBlogPost,
);

/* ================================
   ADMIN ROUTES
================================ */

// Approved blogs
blogRouter.route("/admin/approved").get(verifyAdminJWT, getApprovedAdminBlogs);

// Pending blogs
blogRouter.route("/admin/pending").get(verifyAdminJWT, getPendingAdminBlogs);

// All blogs
blogRouter.route("/admin").get(verifyAdminJWT, getAllBlogPosts);

// Approve / delete
blogRouter
  .route("/admin/:id")
  .put(verifyAdminJWT, approveBlogPost)
  .delete(verifyAdminJWT, deleteBlogPost);

// Reject blog
blogRouter.route("/reject/:id").put(verifyAdminJWT, rejectBlogPost);

/* ================================
   BLOG DETAIL (ALWAYS LAST)
================================ */

blogRouter.route("/:id").get(getBlogPostById);

export default blogRouter;
