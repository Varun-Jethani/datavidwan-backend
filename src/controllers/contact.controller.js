import asyncHandler from "../utils/asynchandler.js";
import ContactModel from "../models/contact.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiresponse.js";
import sendEmail from "../utils/Emailer.js";

const postContact = asyncHandler(async (req, res) => {
    let { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        throw new ApiError(400, "All fields are required");
    }
    email = email.trim().toLowerCase();
    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }
    subject = subject.trim();
    if (subject.length < 2 || subject.length > 200) {
        throw new ApiError(400, "Subject must be between 2 and 200 characters");
    }

     // Optionally, you can send an email notification here
    // await sendEmail({
    //     to: email,
    //     subject: "Contact Form Submission",
    //     text: `Thank you for contacting us, ${name}. We will get back to you soon.`,
    //     html: `<p>Thank you for contacting us, <strong>${name}</strong>.</p>
    //            <p>We have received your message:</p>
    //            <p><strong>Subject:</strong> ${subject}</p>
    //            <p><strong>Message:</strong> ${message}</p>
    //            <p>We will get back to you soon.</p>`
    // });


    // check if emailer has already contacted for the same subject
    const existingContact = await ContactModel.find({ email, subject });

    if (existingContact.length > 0) {
        throw new ApiError(400, "You have already contacted us about this subject");
    }   

    const contact = await ContactModel.create({
        name,
        email,
        subject,
        message,
    });
    if (!contact) {
        throw new ApiError(500, "Failed to create contact");
    }

   


    res.status(201).json(new ApiResponse("Your message has been sent successfully", contact));
});

const getContacts = asyncHandler(async (req, res) => {
    const contacts = await ContactModel.find();
    res.status(200).json(new ApiResponse("Contacts retrieved successfully", contacts));
});

const deleteContact = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contact = await ContactModel.findByIdAndDelete(id);

    if (!contact) {
        throw new ApiError(404, "Contact not found");
    }

    res.status(200).json(new ApiResponse("Contact deleted successfully", contact));
});

export{
    postContact,
    getContacts,
    deleteContact
}

