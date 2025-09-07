import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";
import catchAsync from "./catchAsync.js";
import AppError from "./appError.js";

export const protectRoute = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(new AppError("Unauthhorized ~ No Token Provided", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    return next(new AppError("Unauthhorized ~ Invalid Token", 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  req.user = user;

  next();
});
