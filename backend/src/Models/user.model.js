import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, // يحول الايميل كله لحروف صغيرة
      validate: [validator.isEmail, "Invalid email format"], // يتحقق إن الايميل صحيح
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true, // يشيل المسافات الزايدة من البداية والنهاية
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [50, "Full name must be less than 50 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // ❌ مش بيرجّع الباسورد في الاستعلامات (أمان)
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
