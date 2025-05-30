import mongoose from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const blogSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true,
        },
        exerpt:{
            type: String,
            required: true,
        },
        content:{
            type: String,
            required: true,
        },
        category:{
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
            ref: "User",
            required: true,
        },
        approved:{
            type: Boolean,
            default: false,
        },
        status:{
            type: Number,
            default: 0, // 0: pending, 1: approved, 2: rejected
            enum: [0, 1, 2],
        },
        rejectionReason:{
            type: String,
            default: "",
        },
        approvedBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
        
    },
    { timestamps: true })

blogSchema.plugin(mongooseAggregatePaginate);

const blogModel = mongoose.model("Blog", blogSchema);
export default blogModel;
