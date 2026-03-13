import asyncHandler from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import blogModel from "../models/blog.model.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import commentModel from "../models/comment.model.js";

/* ================================
   CREATE BLOG POST (PDF + IMAGES)
================================ */
const createBlogPost = asyncHandler(async (req, res) => {
  const { title, category, excerpt } = req.body;

  if (!title || !category || !excerpt) {
    return res
      .status(400)
      .json(new ApiResponse(false, "Please fill all the fields"));
  }

  const imageFiles = req.files?.images || [];
  const pdfFile = req.files?.pdf?.[0];

  if (!pdfFile) {
    return res.status(400).json(new ApiResponse(false, "PDF file is required"));
  }

  const images = [];

  for (const file of imageFiles) {
    const uploadedImage = await uploadToCloudinary(file.path, "image");
    if (uploadedImage?.url) images.push(uploadedImage.url);
  }

  const uploadedPdf = await uploadToCloudinary(pdfFile.path, "raw");

  if (!uploadedPdf?.url) {
    return res.status(500).json(new ApiResponse(false, "PDF upload failed"));
  }

  const blogPost = await blogModel.create({
    title,
    excerpt,
    category,
    images,
    pdf: uploadedPdf.url,
    userid: req.user.id,
  });

  return res
    .status(201)
    .json(new ApiResponse(true, "Blog post created successfully", blogPost));
});

/* ================================
   GET APPROVED BLOG POSTS (PUBLIC)
================================ */
const getApprovedBlogPosts = asyncHandler(async (req, res) => {
  const blogs = await blogModel
    .find({ approved: true })
    .populate("userid", "name");

  return res
    .status(200)
    .json(new ApiResponse(true, "Approved Blog Posts", blogs));
});

/* ================================
   GET BLOG BY ID
================================ */
const getBlogPostById = asyncHandler(async (req, res) => {
  const blogPost = await blogModel
    .findById(req.params.id)
    .populate("userid", "name");

  if (!blogPost) {
    return res.status(404).json(new ApiResponse(false, "Blog post not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(true, "Blog post retrieved successfully", blogPost));
});

/* ================================
   APPROVE BLOG
================================ */
const approveBlogPost = asyncHandler(async (req, res) => {
  const blogPost = await blogModel.findById(req.params.id);

  if (!blogPost) {
    return res.status(404).json(new ApiResponse(false, "Blog post not found"));
  }

  blogPost.approved = true;
  blogPost.approvedBy = req.admin._id;
  blogPost.status = 1;
  blogPost.rejectionReason = "";

  await blogPost.save();

  return res
    .status(200)
    .json(new ApiResponse(true, "Blog post approved successfully", blogPost));
});

/* ================================
   DELETE BLOG
================================ */
const deleteBlogPost = asyncHandler(async (req, res) => {
  const blogPost = await blogModel.findById(req.params.id);

  if (!blogPost) {
    return res.status(404).json(new ApiResponse(false, "Blog post not found"));
  }

  if (blogPost.userid.toString() !== req.user?.id && !req.admin) {
    return res
      .status(403)
      .json(
        new ApiResponse(
          false,
          "You are not authorized to delete this blog post",
        ),
      );
  }

  const imgs = Array.isArray(blogPost.images) ? blogPost.images : [];

  for (const image of imgs) {
    try {
      await deleteFromCloudinary(image);
    } catch (e) {
      console.error("Cloudinary image delete failed:", e);
    }
  }

  if (blogPost.pdf) {
    try {
      await deleteFromCloudinary(blogPost.pdf, "raw");
    } catch (e) {
      console.error("Cloudinary pdf delete failed:", e);
    }
  }

  await blogModel.findByIdAndDelete(req.params.id);
  await commentModel.deleteMany({ blogId: req.params.id });

  return res
    .status(200)
    .json(
      new ApiResponse(true, "Blog post and its comments deleted successfully"),
    );
});

/* ================================
   USER BLOG POSTS
================================ */
const getUserBlogPosts = asyncHandler(async (req, res) => {
  const blogPosts = await blogModel
    .find({ userid: req.user.id })
    .populate("userid", "name");

  return res
    .status(200)
    .json(new ApiResponse(true, "User Blog Posts", blogPosts));
});

/* ================================
   ALL BLOG POSTS (ADMIN)
================================ */
const getAllBlogPosts = asyncHandler(async (req, res) => {
  const blogs = await blogModel.find().populate("userid", "name");

  return res.status(200).json(new ApiResponse(true, "All Blog Posts", blogs));
});

/* ================================
   APPROVED BLOGS (ADMIN)
================================ */
const getApprovedAdminBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogModel
    .find({ approved: true })
    .populate("userid", "name");

  return res.status(200).json(new ApiResponse(true, "Approved blogs", blogs));
});

/* ================================
   PENDING BLOGS (ADMIN)
================================ */
const getPendingAdminBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogModel
    .find({ approved: false, status: 0 })
    .populate("userid", "name");

  return res.status(200).json(new ApiResponse(true, "Pending blogs", blogs));
});

/* ================================
   UPDATE BLOG
================================ */
const updateBlogPost = asyncHandler(async (req, res) => {
  const { title, category, excerpt } = req.body;

  if (!title || !category || !excerpt) {
    return res
      .status(400)
      .json(new ApiResponse(false, "Please fill all the fields"));
  }

  const blogPost = await blogModel.findById(req.params.id);

  if (!blogPost) {
    return res.status(404).json(new ApiResponse(false, "Blog post not found"));
  }

  blogPost.title = title;
  blogPost.category = category;
  blogPost.excerpt = excerpt;

  blogPost.approved = false;
  blogPost.approvedBy = null;
  blogPost.status = 0;

  const pdfFile = req.files?.pdf?.[0];

  if (pdfFile) {
    if (blogPost.pdf) {
      await deleteFromCloudinary(blogPost.pdf, "raw");
    }

    const uploadedPdf = await uploadToCloudinary(pdfFile.path, "raw");
    blogPost.pdf = uploadedPdf.url;
  }

  await blogPost.save();

  return res
    .status(200)
    .json(new ApiResponse(true, "Blog post updated successfully", blogPost));
});

/* ================================
   REJECT BLOG
================================ */
const rejectBlogPost = asyncHandler(async (req, res) => {
  const blogPost = await blogModel.findById(req.params.id);

  if (!blogPost) {
    return res.status(404).json(new ApiResponse(false, "Blog post not found"));
  }

  blogPost.status = 2;
  blogPost.rejectionReason = req.body.reason || "No reason provided";
  blogPost.approved = false;
  blogPost.approvedBy = req.admin._id;

  await blogPost.save();

  return res
    .status(200)
    .json(new ApiResponse(true, "Blog post rejected successfully", blogPost));
});

/* ================================
   EXPORTS
================================ */

export {
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
};
