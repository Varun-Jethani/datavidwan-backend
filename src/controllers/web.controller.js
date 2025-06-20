import serviceModel from "../models/service.model.js";
import galleryModel from "../models/gallery.model.js";
import courseModel from "../models/course.model.js";
import adminModel from "../models/admin.model.js";
import asyncHandler from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";
import ContactModel from "../models/contact.model.js";
import ConsultModel from "../models/consult.model.js";
import blogModel from "../models/blog.model.js";
import userModel from "../models/user.model.js";
import testimonialModel from "../models/testimonials.model.js";

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
        const { title, description, process, benefits } = req.body;
        if (!title || !description || !process || !benefits) {
            throw new ApiError(400, "Please fill all the fields");
        }
        const existedService = await serviceModel.findOne({ title });
        if (existedService) {
            return res.status(400).json({
                success: false,
                message: "Service already exists",
            });
        }
        //get order of the last service
        const lastService = await serviceModel.findOne().sort({ order: -1 });
        const order = lastService ? lastService.order + 1 : 1; // If no services exist, start with order 1
        const newService = await serviceModel.create({
            name:title,
            description,
            process,
            benefits,
            order,
            admin: req.admin._id
        });
        return res.status(201).json(new ApiResponse(true, "Service created successfully", newService));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to create service");
    }
})

const addCourse = asyncHandler(async (req, res) => {
    try {
        const {title, description, price, mode, duration, deliverables, tools, modules, heading} = req.body;
        if (!title || !description || !price || !mode || !duration || !deliverables || !tools || !modules || !heading) {
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
        //order
        const lastCourse = await courseModel.findOne().sort({ order: -1 });
        const order = lastCourse ? lastCourse.order + 1 : 1; // If no courses exist, start with order 1
        const newCourse = await courseModel.create({
            title,
            heading,
            description,
            price,
            mode,
            duration,
            deliverables,
            tools,
            modules,
            order,
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
        const admin = req.admin._id;
        if (!admin) {
            throw new ApiError(401, "Unauthorized request here");
        }
        
        const imageUrls = [];
        for (const image of images) {
            const uploadedImage = await uploadToCloudinary(image.path);
            if (!uploadedImage) {
                throw new ApiError(500, "Unable to upload an image to cloudinary");
            }
            imageUrls.push(uploadedImage.url);
        };
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
        const { id, title, description, process, benefits } = req.body;
        if (!title || !description || !process || !benefits) {
            throw new ApiError(400, "Please fill all the fields");
        }
        const updatedService = await serviceModel.findByIdAndUpdate(
            id,
            { name:title, description, process, benefits},
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
        const { id, title, description, price, mode, duration, deliverables, tools, modules, heading } = req.body;
        if (!title || !description || !price || !mode || !duration || !deliverables || !tools || !modules || !heading) {
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
            { title, heading, description, price, mode, duration, deliverables, tools, modules, coverImage },
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

const changeCourseOrder = asyncHandler(async (req, res) => {
    // drag and drop functionality to change the order of courses
    const {orderedCourseIds} = req.body;
    if (!orderedCourseIds || !Array.isArray(orderedCourseIds)) {
        throw new ApiError(400, "Please provide an array of course IDs");
    }
    try {
        const total = orderedCourseIds.length;
        const bulkOps = orderedCourseIds.map((courseId, index) => ({
            updateOne:
            {
                filter: { _id: courseId },
                update: { order: total - index } // Reverse order to maintain the drag and drop effect
            }
        }));
        await courseModel.bulkWrite(bulkOps);
        return res.status(200).json(new ApiResponse(true, "Course order updated successfully"));
        } catch (error) {
    throw new ApiError(500, error?.message || "Unable to update course order");
    }
});

const changeServiceOrder = asyncHandler(async (req, res) => {
    // drag and drop functionality to change the order of services
    const { orderedServiceIds } = req.body;
    if (!orderedServiceIds || !Array.isArray(orderedServiceIds)) {
        throw new ApiError(400, "Please provide an array of service IDs");
    }
    try {
        const total = orderedServiceIds.length;
        const bulkOps = orderedServiceIds.map((serviceId, index) => ({
            updateOne: {
                filter: { _id: serviceId },
                update: { order: total - index } // Reverse order to maintain the drag and drop effect
            }
        }));
        await serviceModel.bulkWrite(bulkOps);
        return res.status(200).json(new ApiResponse(true, "Service order updated successfully"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to update service order");
    }
}
);

const getStats = asyncHandler(async (req, res) => {
    try {
        const totalServices = await serviceModel.countDocuments();
        const totalCourses = await courseModel.countDocuments();
        const totalImages = await galleryModel.countDocuments();
        const totalContacts = await ContactModel.countDocuments();
        const totalConsults = await ConsultModel.countDocuments();
        const totalBlogs = await blogModel.countDocuments();
        const totalUsers = await userModel.countDocuments();
        const totalTestimonials = await testimonialModel.countDocuments();

        return res.status(200).json(new ApiResponse(true, "Stats fetched successfully", {
            totalServices,
            totalCourses,
            totalImages,
            totalContacts,
            totalConsults,
            totalBlogs,
            totalUsers,
            totalTestimonials
        }));
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to fetch stats");
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
    deleteImages,
    changeCourseOrder,
    changeServiceOrder,
    getStats
}





