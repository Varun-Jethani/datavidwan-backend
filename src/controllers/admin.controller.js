import asyncHandler from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import adminModel from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ================= REGISTER ================= */
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json(new ApiResponse(false, "All fields required"));
  }

  const existedAdmin = await adminModel.findOne({ email });
  if (existedAdmin) {
    return res.status(400).json(new ApiResponse(false, "Admin already exists"));
  }

  const newAdmin = await adminModel.create({
    name,
    email,
    password: bcrypt.hashSync(password, 10),
  });

  const createdAdmin = await adminModel
    .findById(newAdmin._id)
    .select("-password");

  return res
    .status(201)
    .json(new ApiResponse(true, "Admin created successfully", createdAdmin));
});

/* ================= LOGIN ================= */
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(new ApiResponse(false, "All fields required"));
  }

  const adminDoc = await adminModel.findOne({ email });
  if (!adminDoc) {
    return res.status(404).json(new ApiResponse(false, "Admin not found"));
  }

  const isMatch = bcrypt.compareSync(password, adminDoc.password);
  if (!isMatch) {
    return res.status(401).json(new ApiResponse(false, "Invalid credentials"));
  }

  const token = jwt.sign(
    { id: adminDoc._id, email: adminDoc.email, name: adminDoc.name },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token, {
    httpOnly: true, // 🔐 IMPORTANT
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    domain: ".datavidwan.com",
  });

  return res.status(200).json(
    new ApiResponse(true, "Login successful", {
      admin: {
        id: adminDoc._id,
        name: adminDoc.name,
        email: adminDoc.email,
      },
    }),
  );
});

/* ================= LOGOUT (JWT FREE) ================= */
const logoutAdmin = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: ".datavidwan.com",
  });

  return res.status(200).json(new ApiResponse(true, "Logout successful"));
});

/* ================= PROFILE ================= */
const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await adminModel.findById(req.admin._id).select("-password");

  if (!admin) {
    return res.status(404).json(new ApiResponse(false, "Admin not found"));
  }

  return res.status(200).json(new ApiResponse(true, "Admin profile", admin));
});

/* ================= UPDATE PROFILE ================= */
const updateAdminProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const admin = await adminModel.findById(req.admin._id);
  if (!admin) {
    return res.status(404).json(new ApiResponse(false, "Admin not found"));
  }

  if (name) admin.name = name;
  if (email) admin.email = email;
  if (password) admin.password = bcrypt.hashSync(password, 10);

  await admin.save();

  return res.status(200).json(new ApiResponse(true, "Admin profile updated"));
});

/* ================= TOKEN VALIDATE ================= */
const validateToken = asyncHandler(async (req, res) => {
  // ⚠️ JWT middleware already validated
  return res.status(200).json(new ApiResponse(true, "Token is valid"));
});

export {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  updateAdminProfile,
  validateToken,
};
