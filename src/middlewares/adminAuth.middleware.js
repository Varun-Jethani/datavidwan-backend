import adminModel from "../models/admin.model.js";
import asyncHandler from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";



export const verifyAdminJWT = asyncHandler(async (req, _, next) => {
    try {
        
        const token = req.cookies?.token 
        || req.headers["authorization"]?.replace("Bearer ", "") 
        || req.headers["Authorization"]?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Unauthorized request here");
        }
        
    
        const decodedToken = jwt.verify(token, `${process.env.JWT_SECRET}`)
        
        const admin = await adminModel.findById(decodedToken?.id).select("-password")
        if (!admin) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        req.admin = admin;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unable to authenticate");
    }

});