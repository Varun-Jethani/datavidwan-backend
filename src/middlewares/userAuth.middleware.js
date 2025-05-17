import userModel from "../models/user.model.js";
import asyncHandler from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";



export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {

        const token = req.cookies?.token 
        || req.headers["authorization"]?.replace("Bearer ", "") 
        || req.headers["Authorization"]?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Unauthorized request here");
        }
    
        const decodedToken = jwt.verify(token, `${process.env.JWT_SECRET}`)
        const user = await userModel.findById(decodedToken?.id).select("-password")
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unable to authenticate");
    }

});