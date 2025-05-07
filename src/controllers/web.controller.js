import serviceModel from "../models/service.model.js";
import galleryModel from "../models/gallery.model.js";
import courseModel from "../models/course.model.js";
import adminModel from "../models/admin.model.js";
import asyncHandler from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";

const  getAllServices = asyncHandler(async (req, res) => {
    try {
        const services = await serviceModel.find();
        return res.status(200).json(new ApiResponse(true, "All Services", services));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to fetch services");
    }
})

const  getAllCourses = asyncHandler(async (req, res) => {
    try {
        const courses = await courseModel.find();
        return res.status(200).json(new ApiResponse(true, "All Courses", courses));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to fetch courses");
    }
})

const getAllImages = asyncHandler(async (req, res) => {
    try {
        const images = await galleryModel.find();
        return res.status(200).json(new ApiResponse(true, "All Images", images));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to fetch images");
    }
})

const addService = asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            throw new ApiError(400, "Please fill all the fields");
        }
        const existedService = await serviceModel.findOne({ title });
        if (existedService) {
            return res.status(400).json({
                success: false,
                message: "Service already exists",
            });
        }
        const newService = await serviceModel.create({
            name:title,
            description,
            admin: req.admin._id
        });
        return res.status(201).json(new ApiResponse(true, "Service created successfully", newService));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to create service");
    }
})

const addCourse = asyncHandler(async (req, res) => {
    try {
        const {title, description, tools, modules, heading} = req.body;
        if (!title || !description || !tools || !modules || !heading) {
            throw new ApiError(400, "Please fill all the fields");
        }
        const admin = req.admin._id;
        if (!admin) {
            throw new ApiError(401, "Unauthorized request here");
        }
        const coverImage = req.files?.coverImage[0]?.path;

        let uploadedImage = null;

        if (coverImage){
            uploadedImage = await uploadToCloudinary(coverImage);
        }
        const newCourse = await courseModel.create({
            title,
            heading,
            description,
            tools,
            modules,
            coverImage: coverImage ? uploadedImage.url : null,
            admin
        });
        return res.status(201).json(new ApiResponse(true, "Course created successfully", newCourse));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to create course");
    }
})

const addImages = asyncHandler(async (req, res) => {
    try {
        const { titles, descriptions, dates } = req.body;
        if (!titles || !descriptions ) {
            throw new ApiError(400, "Please fill all the fields");
        }
        // const images = req.files?.images;
        if (!req.files) {
            throw new ApiError(400, "Please upload at least one image");
        }
        const images = req.files
        console.log(images)
        const admin = req.admin._id;
        if (!admin) {
            throw new ApiError(401, "Unauthorized request here");
        }
        const imageUrls = await Promise.all(
            images.map(async (image) => {
                const uploadedImage = await uploadToCloudinary(image.path);
                return uploadedImage.url;
            })
        );
        const newImages = await Promise.all(
            imageUrls.map((url, index) => {
            return galleryModel.create({
                title: Array.isArray(titles) ? titles[index] : titles,
                description: Array.isArray(descriptions) ? descriptions[index] : descriptions,
                date: Array.isArray(dates) ? dates[index] : dates || new Date(),
                image: url,
                admin
            });
            })
        );
        return res.status(201).json(new ApiResponse(true, "Images added successfully", newImages));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to add images");
    }
})

const updateService = asyncHandler(async (req, res) => {
    try {
        const { id, title, description } = req.body;
        if (!title || !description) {
            throw new ApiError(400, "Please fill all the fields");
        }
        const updatedService = await serviceModel.findByIdAndUpdate(
            id,
            { title, description },
            { new: true }
        );
        if (!updatedService) {
            throw new ApiError(404, "Service not found");
        }
        return res.status(200).json(new ApiResponse(true, "Service updated successfully", updatedService));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to update service");
    }
})

const updateCourse = asyncHandler(async (req, res) => {
    try {
        const { id, title, description, tools, modules } = req.body;
        if (!title || !description || !tools || !modules) {
            throw new ApiError(400, "Please fill all the fields");
        }
        if (req.files?.coverImage) {
            const coverImage = req.files.coverImage[0].path;
            const uploadedImage = await uploadToCloudinary(coverImage);
            req.body.coverImage = uploadedImage.url;
        }
        const course = await courseModel.findById(id);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }
        if (course.coverImage) {
            await deleteFromCloudinary(course.coverImage);
        }
        const coverImage = req.body.coverImage || course.coverImage;
        const updatedCourse = await courseModel.findByIdAndUpdate(
            id,
            { title, description, tools, modules, coverImage },
            { new: true }
        );
        if (!updatedCourse) {
            throw new ApiError(404, "Course not found");
        }
        return res.status(200).json(new ApiResponse(true, "Course updated successfully", updatedCourse));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to update course");
    }
})

const updateImages = asyncHandler(async (req, res) => {
    try {
        const { id, title, description, date } = req.body;
        if (!title || !description) {
            throw new ApiError(400, "Please fill all the fields");
        }
        const updatedImage = await galleryModel.findByIdAndUpdate(
            id,
            { title, description, date },
            { new: true }
        );
        if (!updatedImage) {
            throw new ApiError(404, "Image not found");
        }
        return res.status(200).json(new ApiResponse(true, "Image updated successfully", updatedImage));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to update image");
    }
})

const deleteService = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const deletedService = await serviceModel.findByIdAndDelete(id);
        if (!deletedService) {
            throw new ApiError(404, "Service not found");
        }
        return res.status(200).json(new ApiResponse(true, "Service deleted successfully", deletedService));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to delete service");
    }
})

const deleteCourse = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCourse = await courseModel.findByIdAndDelete(id);
        if (!deletedCourse) {
            throw new ApiError(404, "Course not found");
        }
        return res.status(200).json(new ApiResponse(true, "Course deleted successfully", deletedCourse));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to delete course");
    }
})

const deleteImages = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const image = await galleryModel.findById(id);
        if (!image) {
            throw new ApiError(404, "Image not found");
        }
        if (image.image) {
            await deleteFromCloudinary(image.image);
        }
        const deletedImage = await galleryModel.findByIdAndDelete(id);
        return res.status(200).json(new ApiResponse(true, "Image deleted successfully", deletedImage));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to delete image");
    }
})

export {
    getAllServices,
    getAllCourses,
    getAllImages,
    addService,
    addCourse,
    addImages,
    updateService,
    updateCourse,
    updateImages,
    deleteService,
    deleteCourse,
    deleteImages
}





