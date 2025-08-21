import testimonialModel from "../models/testimonials.model.js";
import teamModel from "../models/team.model.js";
import companyModel from "../models/companies.model.js";
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

const addTeamMember = asyncHandler(async (req, res) => {
    const { name, designation, about } = req.body;

    if (!name || !designation || !about) {
        throw new ApiError(400, "Please fill all the fields");
    }

    let image;
    if (req.file) {
        image = await uploadToCloudinary(req.file.path, "image");
    }

    const newTeamMember = await teamModel.create({
        name,
        designation,
        about,
        image: image?.url
    });

    return res.status(201).json(new ApiResponse(true, "Team member added successfully", newTeamMember));
});

const updateTeamMember = asyncHandler(async (req, res) => {
    const { teamMemberId } = req.params;
    const { name, designation, about } = req.body;
    if (!name || !designation || !about) {
        throw new ApiError(400, "Please fill all the fields");
    }
    const teamMember = await teamModel.findById(teamMemberId);
    if (!teamMember) {
        throw new ApiError(404, "Team member not found");
    }
    let image;
    if (req.file) {
        image = await uploadToCloudinary(req.file.path, "image");
        await deleteFromCloudinary(teamMember.image);
    }
    teamMember.name = name;
    teamMember.designation = designation;
    teamMember.about = about;
    teamMember.image = image?.url || teamMember.image;
    await teamMember.save();
    return res.status(200).json(new ApiResponse(true, "Team member updated successfully", teamMember));
});

const deleteTeamMember = asyncHandler(async (req, res) => {
    const { teamMemberId } = req.params;
    const teamMember = await teamModel.findById(teamMemberId);
    if (!teamMember) {
        throw new ApiError(404, "Team member not found");
    }
    await deleteFromCloudinary(teamMember.image);
    await teamModel.findByIdAndDelete(teamMemberId);
    return res.status(200).json(new ApiResponse(true, "Team member deleted successfully"));
});

const getAllTeamMembers = asyncHandler(async (req, res) => {
    const teamMembers = await teamModel.find();
    if (!teamMembers) {
        throw new ApiError(404, "No team members found");
    }
    return res.status(200).json(new ApiResponse(true, "Team members retrieved successfully", teamMembers));

});

const getAllCompanies = asyncHandler(async (req, res) => {
    const companies = await companyModel.find();
    if (!companies) {
        throw new ApiError(404, "No companies found");
    }
    return res.status(200).json(new ApiResponse(true, "Companies retrieved successfully", companies));
});

const addCompany = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "Please fill all the fields");
    }

    let logo;
    if (req.file) {
        logo = await uploadToCloudinary(req.file.path);
    }
    

    const newCompany = await companyModel.create({
        name,
        description,
        logo: logo ? logo.url : null
    });

    return res.status(201).json(new ApiResponse(true, "Company added successfully", newCompany));
});

const updateCompany = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "Please fill all the fields");
    }

    const company = await companyModel.findById(companyId);
    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    let logo;
    if (req.file) {
        logo = await uploadToCloudinary(req.file.path);
        try{
            await deleteFromCloudinary(company.logo);
        }catch(err){
            console.log(err);
        }
    }

    company.name = name;
    company.description = description;
    company.logo = logo ? logo.url : company.logo;

    await company.save();

    return res.status(200).json(new ApiResponse(true, "Company updated successfully", company));
});

const deleteCompany = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const company = await companyModel.findById(companyId);
    if (!company) {
        throw new ApiError(404, "Company not found");
    }
    try{
        await deleteFromCloudinary(company.logo);
    }catch(err){
        console.log(err);
    }
    await companyModel.findByIdAndDelete(companyId);
    return res.status(200).json(new ApiResponse(true, "Company deleted successfully"));
});

export {
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    getAllTestimonials,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    getAllTeamMembers,
    getAllCompanies,
    addCompany,
    updateCompany,
    deleteCompany
};
