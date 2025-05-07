import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});
    
const uploadToCloudinary = async (filepath) => {
    try {
        if (!filepath) return null;
        //upload file to cloudinary
        const response = await cloudinary.uploader.upload(filepath, 
            { resource_type: "auto" });
        fs.unlinkSync(filepath);
        return response;
    } catch(error) {
        fs.unlinkSync(filepath);
        console.log("Cloudinary upload error",error);
        return null;
    }
};

const deleteFromCloudinary = async (publicId, res="image") => {
    try {
        if (!publicId) return null;
        //delete file from cloudinary
        const response = await cloudinary.uploader.destroy(publicId, {resource_type: res});
        return response;
    } catch(error) {
        console.log("Cloudinary delete error",error);
        return null;
    }
}

export { uploadToCloudinary, deleteFromCloudinary };