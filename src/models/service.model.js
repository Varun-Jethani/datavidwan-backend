import mongoose from "mongoose";


const serviceSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: true,
        unique: true,
        },
        description: [
        {
            type: String,
            required: true,
        }
        ],
        process:[
        {
            type: String,
            required: true,
        }
        ],
        benefits:[
        {
            type: String,
            required: true,
        }
        ],
        admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
        }
    },
    { timestamps: true }
);

const serviceModel = mongoose.model("Service", serviceSchema);
export default serviceModel;
