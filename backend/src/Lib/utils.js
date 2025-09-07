import jwt from "jsonwebtoken";

export const generateToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true, // ✅ صح
    secure: process.env.NODE_ENV === "production", // ✅ أوضح
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
  });

  return token;
};
