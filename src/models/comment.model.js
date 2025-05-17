import mongoose from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        approved: {
            type: Boolean,
            default: false,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
    },
    { timestamps: true }
)


commentSchema.plugin(mongooseAggregatePaginate);

const commentModel = mongoose.model("Comment", commentSchema);
export default commentModel;
