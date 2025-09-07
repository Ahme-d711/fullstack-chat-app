import express from "express";
import { protectRoute } from "../Middleware/auth.middleware.js";
import {
  getMessage,
  getUsersForSidebar,
  sendMessage,
} from "../Controllers/message.controller.js";

const router = express.Router();

// GET
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessage);

// POST
router.post("/send/:id", protectRoute, sendMessage);

export default router;
