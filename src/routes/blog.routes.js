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

// ✅ PUBLIC BLOG DETAIL
blogRouter.route("/:id").get(getBlogPostById);

// Get logged-in user's blogs
blogRouter.route("/user").get(verifyJWT, getUserBlogPosts);

// Get / delete single blog (owner)
blogRouter
  .route("/user/:id")
  .get(getBlogPostById)
  .delete(verifyJWT, deleteBlogPost);

// Update blog (PDF replace allowed)
blogRouter.route("/update/:id").put(
  verifyJWT,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
  ]),
  updateBlogPost,
);

blogRouter.route("/admin/approved").get(verifyAdminJWT, getApprovedAdminBlogs);

blogRouter.route("/admin/pending").get(verifyAdminJWT, getPendingAdminBlogs);
/* ================================
   ADMIN ROUTES
================================ */

// Get all blogs (admin)
blogRouter.route("/admin").get(verifyAdminJWT, getAllBlogPosts);

// Approve / delete blog (admin)
blogRouter
  .route("/admin/:id")
  .put(verifyAdminJWT, approveBlogPost)
  .delete(verifyAdminJWT, deleteBlogPost);

// Reject blog
blogRouter.route("/reject/:id").put(verifyAdminJWT, rejectBlogPost);

export default blogRouter;
