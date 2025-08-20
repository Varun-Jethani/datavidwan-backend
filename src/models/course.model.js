import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  topics: [{ type: String }],
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    heading:{
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    mode: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    deliverables: [
      {
        type: String,
        required: true,
      },
    ],
    tools: [{
      type: String,
      required: true,
    }],
    modules: [moduleSchema],
    coverImage: {
      type: String,
    },
    brochure: {
      type: String,
    },
    order:{
      type: Number,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

const courseModel = mongoose.model("Course", courseSchema);
export default courseModel;
