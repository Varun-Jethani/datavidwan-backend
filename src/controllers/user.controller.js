import asyncHandler from "../utils/asynchandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/apiresponse.js";
import userModel from "../models/user.model.js";
import sendEmail from "../utils/Emailer.js";
import UserOTPSchema from "../models/userOTP.model.js";

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }
  const existedUser = await userModel.findOne({ $or: [{ email }] });
  if (existedUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }
  const newUser = await userModel.create({
    name,
    email,
    password: bcrypt.hashSync(password, 10),
  });
  const createdUser = await userModel
    .findById(newUser._id)
    .select("-password");
  if (!createdUser) {
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
  createEmailOTP(newUser._id, email)
    .then(() => {
      console.log("OTP sent to email");
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    });

  return res
    .status(201)
    .json(new ApiResponse(true, "User created successfully", createdUser));
});

const verifyEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and OTP",
    });
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const userOTP = await UserOTPSchema.findOne({ userId: user._id, otp });
  if (!userOTP) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }

  await userModel.findByIdAndUpdate(userOTP.userId, { verified: true });
  await UserOTPSchema.deleteMany({ userId: userOTP.userId }); // Remove OTP after verification

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

//create OTP for email verification normal function
const createEmailOTP = async (userId, email) => {
  await UserOTPSchema.deleteMany({ userId }); // Remove any existing OTPs for the user
  // Generate a new OTP and save it
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  await UserOTPSchema.create({ userId, otp });

  sendEmail({
    to: email,
    subject: "Email Verification OTP",
    text: `Your OTP for email verification is ${otp}. It is valid for 5 minutes.`,
    html: `<p>Your OTP for email verification is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
  });
};

//Send OTP Again
const sendOTPAgain = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide your email",
    });
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  createEmailOTP(user._id, email)
    .then(() => {
      return res.status(200).json({
        success: true,
        message: "OTP sent to email",
      });
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    });
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }
  const userDoc = await userModel.findOne({ email });
  if (userDoc) {
    const pass = bcrypt.compareSync(password, userDoc.password);
    if (pass) {
      jwt.sign(
        { email: userDoc.email, id: userDoc._id, name: userDoc.name },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
        (err, token) => {
          if (err) throw err;
          res
            .cookie("token", token, {
              httpOnly: false,
              secure: process.env.NODE_ENV === "production", // Set secure to true in production
              sameSite: "None", // Required for cross-site cookies
            })
            .json({ token, user: userDoc }); // Include token in response
        }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  }
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    })
    .json({
      message: "Logged out successfully",
    });
});

// User Profile
const userProfile = asyncHandler(async (req, res) => {
  try {
    const user=req.user
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const userProfile = await userModel.findById(user.id).select("-password");
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: userProfile,
    });
  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: e.message,
    });
  }
});
const validateToken = asyncHandler(async (req, res) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1]; // Get token from 'Authorization' header
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, userDoc) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Token invalid" });
    }

    const user = await userModel.findById(userDoc.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  });
});

export { logoutUser, loginUser, userProfile, registerUser, validateToken, verifyEmailOTP, sendOTPAgain };
