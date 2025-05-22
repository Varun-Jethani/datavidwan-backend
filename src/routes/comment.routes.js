import { Router } from "express";

import {
    addComment,
    approveComment,
    getCommentsByPostId,
    getAllCommentsByPostId,
    deleteComment
} from "../controllers/comment.controller.js";

import { verifyAdminJWT } from "../middlewares/adminAuth.middleware.js";
import { verifyJWT } from "../middlewares/userAuth.middleware.js";



const CommentRouter = Router();

CommentRouter.post("/", verifyJWT, addComment);
CommentRouter.patch("/admin/:commentId", verifyAdminJWT, approveComment);
CommentRouter.get("/post/:postId", getCommentsByPostId);
CommentRouter.get("/admin/post/:postId", verifyAdminJWT, getAllCommentsByPostId);
CommentRouter.delete("/delete/:commentId",verifyJWT, deleteComment);
CommentRouter.delete("/admin/:commentId", verifyAdminJWT, deleteComment);


export default CommentRouter;