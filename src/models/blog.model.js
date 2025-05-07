import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true,
        },
        content:{
            type: String,
            required: true,
        },
        images:[
            {
                type: String,
                required: true,
            }
        ],
        userid:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },

    })

const blogModel = mongoose.model("Blog", blogSchema);
export default blogModel;
