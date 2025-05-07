import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
    });
const galleryModel = mongoose.model("Gallery", gallerySchema);
export default galleryModel;