import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import authRoutes from "./Routes/auth.route.js";
import messageRoutes from "./Routes/message.route.js";

import { contactDb } from "./Lib/db.js";
import { app, server } from "./Lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5002;

const __dirname = path.resolve();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // ✅ عشان الكوكيز يتبعت
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser()); // ✅ مهم عشان تقدر توصل للكوكيز

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join((__dirname, "../frontend", "dist", "index.html")));
  });
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  contactDb();
});
