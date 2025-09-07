import cloudinary from "../Lib/cloudinary.js";
import { getReceiverSockelId, io } from "../Lib/socket.js";
import catchAsync from "../Middleware/catchAsync.js";
import Message from "../Models/message.model.js";
import User from "../Models/user.model.js";

export const getUsersForSidebar = catchAsync(async (req, res, next) => {
  const loggedInUserId = req.user._id;
  const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } });

  res.status(200).json({
    status: "success",
    users: filteredUsers,
  });
});

export const getMessage = catchAsync(async (req, res, next) => {
  const { id: userToChatId } = req.params;
  const myId = req.user._id;

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId },
    ],
  });

  res.status(200).json({
    status: "success",
    messages,
  });
});

export const sendMessage = catchAsync(async (req, res, next) => {
  const { text, image } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  let imageUrl;
  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image);
    imageUrl = uploadResponse.secure_url;
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image: imageUrl,
  });

  await newMessage.save();

  //   todo: realtime functionality goes here => socket.io
  const receiverSocketId = getReceiverSockelId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  res.status(200).json({
    status: "success",
    messages: newMessage,
  });
});
