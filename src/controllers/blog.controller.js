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
  const { title, category, exerpt } = req.body;
  console.log("REQ.BODY:", req.body);
  console.log("REQ.FILES:", req.files);
  console.log("REQ.USER:", req.user);
  if (!title || !category || !exerpt) {
    return res
      .status(400)
      .json(new ApiResponse(false, "Please fill all the fields"));
  }

  // multer.fields() => req.files = { images: [], pdf: [] }
  const imageFiles = req.files?.images || [];
  const pdfFile = req.files?.pdf?.[0];

  if (!pdfFile) {
    return res.status(400).json(new ApiResponse(false, "PDF file is required"));
  }

  // Upload images
  const images = [];
  for (const file of imageFiles) {
    const uploadedImage = await uploadToCloudinary(file.path, "blog-images");
    images.push(uploadedImage.url);
  }

  // Upload PDF (raw)
  const uploadedPdf = await uploadToCloudinary(pdfFile.path, "blog-pdf", "raw");

  const blogPost = await blogModel.create({
    title,
    exerpt,
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
   GET APPROVED BLOG POSTS
================================ */
const getApprovedBlogPosts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = -1,
  } = req.query;

  const blogs = await blogModel.aggregatePaginate(
    [
      { $match: { approved: true } },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $addFields: { writer: "$owner.name" } },
      { $unwind: "$writer" },
      {
        $project: {
          _id: 1,
          title: 1,
          exerpt: 1,
          category: 1,
          images: 1,
          pdf: 1,
          createdAt: 1,
          updatedAt: 1, // ✅ admin panel/date use case
          writer: 1,
        },
      },
    ],
    {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: parseInt(sortType) },
    },
  );

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
   DELETE BLOG (IMAGES + PDF)
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

  // Delete images (safe)
  const imgs = Array.isArray(blogPost.images) ? blogPost.images : [];
  for (const image of imgs) {
    try {
      await deleteFromCloudinary(image);
    } catch (e) {
      // keep deleting others even if one fails
      console.error("Cloudinary image delete failed:", e?.message || e);
    }
  }

  // Delete PDF (safe)
  if (blogPost.pdf) {
    try {
      await deleteFromCloudinary(blogPost.pdf, "raw");
    } catch (e) {
      console.error("Cloudinary pdf delete failed:", e?.message || e);
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

  if (!blogPosts || blogPosts.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(false, "No blog posts found for this user"));
  }

  return res
    .status(200)
    .json(new ApiResponse(true, "User Blog Posts", blogPosts));
});

/* ================================
   ALL BLOG POSTS (ADMIN)
================================ */
const getAllBlogPosts = asyncHandler(async (req, res) => {
  const blogPosts = await blogModel.find().populate("userid", "name");
  return res
    .status(200)
    .json(new ApiResponse(true, "All Blog Posts", blogPosts));
});

/* ================================
   UPDATE BLOG (PDF REPLACE)
================================ */
const updateBlogPost = asyncHandler(async (req, res) => {
  const { title, category, exerpt } = req.body;

  if (!title || !category || !exerpt) {
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
  blogPost.exerpt = exerpt;
  blogPost.approved = false;
  blogPost.approvedBy = null;
  blogPost.status = 0;
  blogPost.rejectionReason = "";

  // Replace PDF if provided
  const pdfFile = req.files?.pdf?.[0];
  if (pdfFile) {
    if (blogPost.pdf) {
      try {
        await deleteFromCloudinary(blogPost.pdf, "raw");
      } catch (e) {
        console.error("Old pdf delete failed:", e?.message || e);
      }
    }

    const uploadedPdf = await uploadToCloudinary(
      pdfFile.path,
      "blog-pdf",
      "raw",
    );
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
  const admin = req.admin;

  if (!admin) {
    return res
      .status(403)
      .json(new ApiResponse(false, "You are not authorized"));
  }

  const blogPost = await blogModel.findById(req.params.id);
  if (!blogPost) {
    return res.status(404).json(new ApiResponse(false, "Blog post not found"));
  }

  blogPost.status = 2;
  blogPost.rejectionReason = req.body.reason || "No reason provided";
  blogPost.approved = false;
  blogPost.approvedBy = admin._id;

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
};
