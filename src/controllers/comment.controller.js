import asyncHandler from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import commentModel from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";

// Add Comment
const addComment = asyncHandler(async (req, res) => {
    const { content, postId } = req.body;
    if (!content || !postId) {
        throw new ApiError(400, "Please fill all the fields");
    }
    const newComment = await commentModel.create({
        content,
        blogId: postId,
        userId: req.user._id
    });
    return res.status(201).json(new ApiResponse(true, "Comment added successfully", newComment));
});

const approveComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const comment = await commentModel.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (!req.admin){
        throw new ApiError(403, "You are not authorized to approve comments");
    }
    comment.approved = true;
    comment.approvedBy = req.admin._id;
    await comment.save();
    return res.status(200).json(new ApiResponse(true, "Comment approved successfully", comment));
});

// Get Comments by blog ID
const getCommentsByPostId = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const comments = await commentModel.find({ blogId: postId, approved: true }).populate("userId", "name");
    return res.status(200).json(new ApiResponse(true, "Comments retrieved successfully", comments));
});

const getAllCommentsByPostId = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const comments = await commentModel.find({ blogId: postId }).populate("userId", "name");
    return res.status(200).json(new ApiResponse(true, "Comments retrieved successfully", comments));
});

// Delete Comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const comment = await commentModel.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.userId.toString() !== req.user?.id.toString() && !req.admin) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await commentModel.findByIdAndDelete(commentId);
    return res.status(200).json(new ApiResponse(true, "Comment deleted successfully"));
});

export {
    addComment,
    approveComment,
    getCommentsByPostId,
    getAllCommentsByPostId,
    deleteComment
};

