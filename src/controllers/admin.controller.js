import asyncHandler from "../utils/asynchandler.js";
import { ApiResponse} from "../utils/apiresponse.js";
import adminModel from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all the fields");
    }
    const existedAdmin = await adminModel.findOne({ $or: [{ email }] });
    if (existedAdmin) {
        return res.status(400).json({
        success: false,
        message: "Admin already exists",
        });
    }
    const newAdmin = await adminModel.create({
        name,
        email,
        password: bcrypt.hashSync(password, 10),
    });
    const createdAdmin = await adminModel
        .findById(newAdmin._id)
        .select("-password");
    if (!createdAdmin) {
        return res.status(500).json({
        success: false,
        message: "Failed to create admin",
        });
    }
    return res
        .status(201)
        .json(new ApiResponse(true, "Admin created successfully", createdAdmin));
})

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("Please fill all the fields");
    }
    const adminDoc = await adminModel.findOne({ email });
    if (adminDoc) {
        const pass = bcrypt.compareSync(password, adminDoc.password);
        if (pass) {
            jwt.sign(
                { email: adminDoc.email, id: adminDoc._id, name: adminDoc.name },
                process.env.JWT_SECRET,
                { expiresIn: "1d" },
                (err, token) => {
                    if (err) throw err;
                    res
                        .cookie("token", token, {
                            httpOnly: false,
                            secure: process.env.NODE_ENV === "production",
                        })
                        .status(200)
                        .json(new ApiResponse(true, "Login successful",{ token, adminDoc }));
                }
            );
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
    } else {
        return res.status(404).json({
            success: false,
            message: "Admin not found",
        });
    }
})

const logoutAdmin = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
    });
    return res.status(200).json(new ApiResponse(true, "Logout successful"));
})

const getAdminProfile = asyncHandler(async (req, res) => {
    const admin = await adminModel.findById(req.admin._id).select("-password");
    if (!admin) {
        return res.status(404).json({
            success: false,
            message: "Admin not found",
        });
    }
    return res.status(200).json(new ApiResponse(true, "Admin profile", admin));
})

const updateAdminProfile = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const admin = await adminModel.findById(req.admin._id);
    if (!admin) {
        return res.status(404).json({
            success: false,
            message: "Admin not found",
        });
    }
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (password) admin.password = bcrypt.hashSync(password, 10);
    await admin.save();
    return res.status(200).json(new ApiResponse(true, "Admin profile updated", admin));
})

const validateToken = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        return res.status(200).json(new ApiResponse(true, "Token is valid", decoded));
    });
}
)

export { registerAdmin, loginAdmin, logoutAdmin, getAdminProfile, updateAdminProfile, validateToken };



