import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Using exact variable names from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  } finally {
    // Safely delete local temp file if it exists, regardless of upload success
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

export default uploadOnCloudinary;