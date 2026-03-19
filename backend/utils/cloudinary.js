import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOncloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;

    const response = await cloudinary.uploader.upload(localfilepath, {
      folder: "chat-app",
    });

    fs.unlinkSync(localfilepath);

    return response.secure_url; // ✅ IMPORTANT
  } catch (error) {
    fs.unlinkSync(localfilepath);
    console.log(error);
    return null;
  }
};

export { uploadOncloudinary };