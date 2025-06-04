import consultModel from "../models/consult.model.js";

import asyncHandler from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { ApiError } from "../utils/ApiError.js";

import sendEmail from "../utils/Emailer.js";

const createConsult = asyncHandler(async (req, res) => {
    const { name, email, company, phone, interest, message } = req.body;

    if (!name || !email || !interest || !message) {
        throw new ApiError(400, "Please fill all the required fields");
    }

    // Validate email format
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }
    // Validate phone number format (optional, can be customized)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    if (phone && !phoneRegex.test(phone)) {
        throw new ApiError(400, "Invalid phone number format");
    }

    let html = `<p>Thank you for your consultation request, <strong>${name}</strong>.</p>
               <p>We have received your request with the following details:</p>`
    if (company) {
        html += `<p><strong>Company:</strong> ${company}</p>`;
    }
    if (phone) {
        html += `<p><strong>Phone:</strong> ${phone}</p>`;
    }
    html += `<p><strong>Interest:</strong> ${interest}</p>
             <p><strong>Message:</strong> ${message}</p>
             <p>We will get back to you soon.</p>`;

    sendEmail({
        to: email,
        subject: "Consultation Request Received",
        text: `Thank you for your consultation request, ${name}. We will get back to you soon.`,
        html
    })



    const newConsult = await consultModel.create({
        name,
        email,
        company,
        phone,
        interest,
        message,
    });

    if (!newConsult) {
        throw new ApiError(500, "Failed to create consultation request");
    }

    return res.status(201).json(new ApiResponse(true, "Consultation request created successfully", newConsult));

})

const getAllConsults = asyncHandler(async (req, res) => {
    const consults = await consultModel.find();
    return res.status(200).json(new ApiResponse(true, "Consultation requests fetched successfully", consults));
});


const deleteConsult = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Consultation ID is required");
    }

    const consult = await consultModel.findByIdAndDelete(id);

    if (!consult) {
        throw new ApiError(404, "Consultation request not found");
    }

    return res.status(200).json(new ApiResponse(true, "Consultation request deleted successfully", consult));
});

export {
    createConsult,
    getAllConsults,
    deleteConsult
};

