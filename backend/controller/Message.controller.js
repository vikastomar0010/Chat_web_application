import ChatModel from "../model/Chatmodel.js";
import MessageModel from "../model/Messages.js";
import UsersModel from "../model/Users.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// ✅ SEND TEXT MESSAGE
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ msg: "Must have content and chatID" });
  }

  try {
    const message = await MessageModel.create({
      content,
      chat: chatId,
      sender: req.user._id,
      status: "sent", // ✅ IMPORTANT
    });

    let updatedmessage = await MessageModel.findById(message._id)
      .populate("sender", "name pic email")
      .populate("chat");

    updatedmessage = await UsersModel.populate(updatedmessage, {
      path: "chat.users",
      select: "name pic email",
    });

    await ChatModel.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    return res.status(200).json(updatedmessage);
  } catch (err) {
    return res.status(400).json({ msg: err.message });
  }
};

// ✅ GET ALL MESSAGES
const getAllmessage = async (req, res) => {
  try {
    const allchat = await MessageModel.find({
      chat: req.params.chatIds,
    })
      .populate("sender", "-password")
      .populate("chat");

    return res.status(200).json(allchat);
  } catch (err) {
    return res.status(400).json({ msg: err.message });
  }
};

// ✅ DELETE MESSAGE
const DeleteMessage = async (req, res) => {
  try {
    const { msgid } = req.body;

    if (!msgid) {
      return res.status(400).json({ msg: "msgId is required" });
    }

    for (let index = 0; index < msgid.length; index++) {
      const id = msgid[index];
      await MessageModel.findByIdAndDelete(id);
    }

    return res
      .status(200)
      .json({ msg: "Message Deleted Successfully" });
  } catch (error) {
    console.log(error.message);
  }
};

// ✅ SEND IMAGE MESSAGE (FIXED)
const msgImage = async (req, res) => {
  try {
    const imgpath = req.file?.path;
    const { chatId } = req.body;
    const sender = req.user?._id;

    if (!imgpath || !chatId) {
      return res.status(400).json({ msg: "Missing file or chatId" });
    }

    const imageUrl = await uploadOncloudinary(imgpath);

    if (!imageUrl) {
      return res.status(500).json({ msg: "Cloudinary upload failed" });
    }

    // 🔥 FIX: ADD STATUS HERE
    const msg = await MessageModel.create({
      msgimage: imageUrl,
      chat: chatId,
      sender,
      status: "sent", // ✅ THIS WAS MISSING
    });

    let updatedmessage = await MessageModel.findById(msg._id)
      .populate("sender", "name pic email")
      .populate("chat");

    updatedmessage = await UsersModel.populate(updatedmessage, {
      path: "chat.users",
      select: "name pic email",
    });

    await ChatModel.findByIdAndUpdate(chatId, {
      latestMessage: msg,
    });

    return res.status(200).json(updatedmessage);
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ msg: error.message });
  }
};

const imgcheck = async (req, res) => {
  console.log("Image saved Successfully");
};

export {
  sendMessage,
  getAllmessage,
  DeleteMessage,
  msgImage,
  imgcheck,
};