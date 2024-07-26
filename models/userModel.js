import mongoose from "mongoose";

const videoStatusSchema = new mongoose.Schema({
  unlocked: { type: Boolean, default: false },
  watched: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema(
  {
    firstName : {
      type : String,
      required : "First Name is required"
    },
    lastName : {
      type : String,
      required : "Last Name is required"
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
      default: false,
    },
    sport:{
      type : String
    },
    certificateDataUrl: {
      type : String,
      default : ""
    },
  
    videoStatus: {
      type: [videoStatusSchema],
      default: () => {
        const statuses = Array(10).fill({ unlocked: false, watched: false });
        statuses[0] = { unlocked: true, watched: false };
        return statuses;
      },
    },
    otp: {
      type: String,
    },
    otpExpirationTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
