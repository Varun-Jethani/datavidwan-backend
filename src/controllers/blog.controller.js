import asyncHandler from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import blogModel from "../models/blog.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import commentModel from "../models/comment.model.js";

// Create a new blog post
const createBlogPost = asyncHandler(async (req, res) => {
    const { title, content, category, exerpt } = req.body;
    if (!title || !content || !category || !exerpt) {
        return res.status(400).json(new ApiResponse(false, "Please fill all the fields"));
    }

    const images = req.files.map(file => file.path);
    // upload images to Cloudinary
    for (let i = 0; i < images.length; i++) {
        const uploadedImage = await uploadToCloudinary(images[i], "blog");
        images[i] = uploadedImage.url;
    }

    const blogPost = await blogModel.create({ title, exerpt, content, category, images, userid: req.user.id });
    return res.status(201).json(new ApiResponse(true, "Blog post created successfully", blogPost));
});

// Get all blog posts

const getApprovedBlogPosts = asyncHandler(async (req, res) => { // Fetch all blog posts which are approved having only title, image, username, date with aggregatepaginate
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = -1 } = req.query;

    const blogs = await blogModel.aggregatePaginate(
        [
            {
                $match: { approved: true }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userid",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $addFields:{
                    writer: "$owner.name"
                }
            },
            {
                $unwind: "$writer"
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    exerpt: 1,
                    category: 1,
                    content: 1,
                    images: 1,
                    createdAt: 1,
                    writer: 1
                }
            }
        ],
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { [sortBy]: parseInt(sortType) }
        }
    )
    if (!blogs || blogs.length === 0) {
        return res.status(404).json(new ApiResponse(false, "No approved blog posts found"));
    }
    return res.status(200).json(new ApiResponse(true, "Approved Blog Posts", blogs));

    // const blogPosts = await blogModel.find({ approved: true }).populate("userid", "name").select("title images createdAt userid").sort({ createdAt: -1 }); 
    // return res.status(200).json(new ApiResponse(true, "All Blog Posts", blogPosts));
});

// Get a single blog post by ID
const getBlogPostById = asyncHandler(async (req, res) => {
    const blogPost = await blogModel.findById(req.params.id).populate("userid", "name");
    if (!blogPost) {
        return res.status(404).json(new ApiResponse(false, "Blog post not found"));
    }

    return res.status(200).json(new ApiResponse(true, "Blog post retrieved successfully", blogPost));
});

const approveBlogPost = asyncHandler(async (req, res) => {
    const blogPost = await blogModel.findById(req.params.id);
    if (!blogPost) {
        return res.status(404).json(new ApiResponse(false, "Blog post not found"));
    }

    blogPost.approved = true;
    blogPost.approvedBy = req.admin._id; // Assuming req.admin contains the admin details
    blogPost.status = 1; // Set status to approved
    blogPost.rejectionReason = ""; // Clear any previous rejection reason
    await blogPost.save();

    return res.status(200).json(new ApiResponse(true, "Blog post approved successfully", blogPost));
});
// Delete a blog post
const deleteBlogPost = asyncHandler(async (req, res) => {
    const blogPost = await blogModel.findById(req.params.id);
    if (!blogPost) {
        return res.status(404).json(new ApiResponse(false, "Blog post not found"));
    }
    if (blogPost.userid.toString() !== req.user?.id && !req.admin) {
        return res.status(403).json(new ApiResponse(false, "You are not authorized to delete this blog post"));
    }

    // Delete images from Cloudinary
    for (const image of blogPost.images) {
        await deleteFromCloudinary(image);
    }

    await blogModel.findByIdAndDelete(req.params.id);
    await commentModel.deleteMany({ blogId: req.params.id });
    return res.status(200).json(new ApiResponse(true, "Blog post and its comments deleted successfully"));    
});

const getUserBlogPosts = asyncHandler(async (req, res) => {
    const blogPosts = await blogModel.find({ userid: req.user.id }).populate("userid", "name");
    if (!blogPosts) {
        return res.status(404).json(new ApiResponse(false, "No blog posts found for this user"));
    }

    return res.status(200).json(new ApiResponse(true, "User Blog Posts", blogPosts));
});

const getAllBlogPosts = asyncHandler(async (req, res) => {
    const blogPosts = await blogModel.find().populate("userid", "name");
    if (!blogPosts) {
        return res.status(404).json(new ApiResponse(false, "No blog posts found"));
    }

    return res.status(200).json(new ApiResponse(true, "All Blog Posts", blogPosts));
});

const updateBlogPost = asyncHandler(async (req, res) => {
    const { title, content, category, exerpt } = req.body;
    if (!title || !content || !category || !exerpt) {
        return res.status(400).json(new ApiResponse(false, "Please fill all the fields"));
    }

    const blogPost = await blogModel.findById(req.params.id);
    if (!blogPost) {
        return res.status(404).json(new ApiResponse(false, "Blog post not found"));
    }

    blogPost.title = title;
    blogPost.content = content;
    blogPost.category = category;
    blogPost.exerpt = exerpt;
    blogPost.approved = false; // Reset approval status
    blogPost.approvedBy = null; // Reset approvedBy field
    blogPost.status = 0; // Reset status to pending
    blogPost.rejectionReason = ""; // Clear any previous rejection reason
    await blogPost.save();
    return res.status(200).json(new ApiResponse(true, "Blog post updated successfully", blogPost));
});

const rejectBlogPost = asyncHandler(async (req, res) => {
    const admin = req.admin;
    if (!admin) {
        return res.status(403).json(new ApiResponse(false, "You are not authorized to reject blog posts"));
    }
    const blogPost = await blogModel.findById(req.params.id);
    if (!blogPost) {
        return res.status(404).json(new ApiResponse(false, "Blog post not found"));
    }

    blogPost.status = 2; // Set status to rejected
    blogPost.rejectionReason = req.body.reason || "No reason provided"; // Set rejection reason
    blogPost.approved = false; // Set approved to false
    blogPost.approvedBy = admin._id; // Set the admin who rejected the post
    await blogPost.save();

    return res.status(200).json(new ApiResponse(true, "Blog post rejected successfully", blogPost));
});




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




