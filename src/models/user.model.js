import mongoose from "mongoose";

const coursesSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    status:{
      type: String,
      enum: ["completed", "in-progress"],
      default: "in-progress",
    }
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    courses: [coursesSchema],
    verified: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);
const userModel = mongoose.model("User", userSchema);
export default userModel;
