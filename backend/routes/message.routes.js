import express from "express";
import protect from "../middleware/authuser.js";
import {
  DeleteMessage,
  getAllmessage,
  msgImage,
  sendMessage,
} from "../controller/Message.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const routerm = express.Router();

routerm.route("/").post(protect, sendMessage);
routerm.route("/:chatIds").get(protect, getAllmessage);
routerm.route("/delete").post(protect, DeleteMessage);

// ✅ SINGLE CLEAN ROUTE
routerm.route("/img").post(protect, upload.single("file"), msgImage);

export default routerm;