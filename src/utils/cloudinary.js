import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filepath, resourceType = "image") => {
  try {
    if (!filepath) return null;

    const response = await cloudinary.uploader.upload(filepath, {
      resource_type: resourceType, // "image" | "raw"
    });

    fs.unlinkSync(filepath);

    // 🔥 IMPORTANT FIX FOR PDF
    if (resourceType === "raw") {
      return {
        url: response.secure_url.replace("/image/upload/", "/raw/upload/"),
        public_id: response.public_id,
      };
    }

    return {
      url: response.secure_url,
      public_id: response.public_id,
    };
  } catch (error) {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    console.log("Cloudinary upload error", error);
    return null;
  }
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return response;
  } catch (error) {
    console.log("Cloudinary delete error", error);
    return null;
  }
};

export { uploadToCloudinary, deleteFromCloudinary };
