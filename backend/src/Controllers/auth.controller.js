// controllers/authController.js
import bcrypt from "bcryptjs";
import User from "../Models/user.model.js";
import { generateToken } from "../Lib/utils.js";
import catchAsync from "../Middleware/catchAsync.js";
import AppError from "../Middleware/appError.js";
import cloudinary from "../Lib/cloudinary.js";

export const signup = catchAsync(async (req, res, next) => {
  const { fullName, email, password } = req.body;

  // ✅ التحقق من المدخلات (Validation)
  if (!fullName || !email || !password) {
    return next(new AppError("All fields are required", 400));
  }
  if (password.length < 8) {
    return next(new AppError("Password must be at least 8 characters", 400));
  }

  // ✅ التحقق من وجود المستخدم مسبقاً
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already exists", 400));
  }

  // ✅ تشفير الباسورد
  const salt = await bcrypt.genSalt(12); // قوة أعلى من 10
  const hashedPassword = await bcrypt.hash(password, salt);

  // ✅ إنشاء المستخدم
  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
  });

  // ✅ إنشاء التوكن
  generateToken(newUser._id, res);

  // ✅ الرد على العميل
  res.status(201).json({
    status: "success",
    user: {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic || null,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // ✅ تحقق من المدخلات
  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  // ✅ البحث عن المستخدم + جلب الباسورد (لأنه select: false)
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Invalid credentials", 400));
  }

  // ✅ التحقق من الباسورد
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return next(new AppError("Invalid credentials", 400));
  }

  // ✅ إنشاء التوكن
  generateToken(user._id, res);

  // ✅ الرد
  res.status(200).json({
    status: "success",
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic || null,
    },
  });
});

export const logout = catchAsync(async (req, res, next) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production", // في الإنتاج لازم https
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const { profilePic } = req.body;
  const userId = req.user._id;

  if (!profilePic) {
    return next(new AppError("Profile pic is required", 400));
  }

  const uploadResponse = await cloudinary.uploader.upload(profilePic);
  const updateUser = await User.findByIdAndUpdate(
    userId,
    { profilePic: uploadResponse.secure_url },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    user: updateUser,
  });
});

export const checkAuth = catchAsync(async (req, res, next) => {
  res.status(200).json({
    user: req.user,
  });
});
