import testimonialModel from "../models/testimonials.model.js";
import asyncHandler from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

const addTestimonial = asyncHandler(async (req, res) => {
    const { name, designation, content } = req.body;
    if (!name || !designation || !content) {
        throw new ApiError(400, "Please fill all the fields");
    }

    let image;
    if (req.file) {
        image = await uploadToCloudinary(req.file.path, "image");
    }

    const newTestimonial = await testimonialModel.create({
        name,
        designation,
        content,
        image: image?.url
    });

    return res.status(201).json(new ApiResponse(true, "Testimonial added successfully", newTestimonial));
});

const updateTestimonial = asyncHandler(async (req, res) => {
    const { testimonialId } = req.params;
    const { name, designation, content } = req.body;

    if (!name || !designation || !content) {
        throw new ApiError(400, "Please fill all the fields");
    }

    const testimonial = await testimonialModel.findById(testimonialId);
    if (!testimonial) {
        throw new ApiError(404, "Testimonial not found");
    }

    let image;
    if (req.file) {
        image = await uploadToCloudinary(req.file.path, "image");
        await deleteFromCloudinary(testimonial.image);
    }

    testimonial.name = name;
    testimonial.designation = designation;
    testimonial.content = content;
    testimonial.image = image?.url || testimonial.image;

    await testimonial.save();

    return res.status(200).json(new ApiResponse(true, "Testimonial updated successfully", testimonial));
});

const getAllTestimonials = asyncHandler(async (req, res) => {
    const testimonials = await testimonialModel.find();
    if (!testimonials) {
        throw new ApiError(404, "No testimonials found");
    }
    return res.status(200).json(new ApiResponse(true, "Testimonials retrieved successfully", testimonials));
}
);

const deleteTestimonial = asyncHandler(async (req, res) => {
    const { testimonialId } = req.params;

    const testimonial = await testimonialModel.findById(testimonialId);
    if (!testimonial) {
        throw new ApiError(404, "Testimonial not found");
    }

    await deleteFromCloudinary(testimonial.image);
    await testimonialModel.findByIdAndDelete(testimonialId);
    return res.status(200).json(new ApiResponse(true, "Testimonial deleted successfully"));
}
);

export {
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    getAllTestimonials
};
