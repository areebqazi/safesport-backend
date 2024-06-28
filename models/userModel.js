import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "Name is required",
      unique: true,
    },
    email: {
      type: String,
      required: "Email is required",
      unique: true,
    },
    password: {
      type: String,
      required: "Password is required",
    },
    birthdate: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default : false
    },
    videoStatus: [
        {
            unlocked: { type: Boolean, default: false },
            watched: { type: Boolean, default: false }
        }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
