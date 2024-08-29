import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const UploadMediaToCloudinary = async (localMediaFilePath: string) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!localMediaFilePath) return null;
    const uploadedFile = await cloudinary.uploader.upload(localMediaFilePath, {
      resource_type: "auto",
    });

    const mediaURL = cloudinary.url(uploadedFile.public_id, {
      transformation: [
        {
          fetch_format: "auto",
          quality: "auto",
        },
      ],
    });
    fs.unlinkSync(localMediaFilePath);
    return mediaURL;
  } catch (error) {
    console.log("cloudinary error : ", error);
    fs.unlinkSync(localMediaFilePath);
    return null;
  }
};

const DeleteMediaFromCloudinary = null; // handle media removal from cloudinary on file update/ deletion

export { DeleteMediaFromCloudinary, UploadMediaToCloudinary };
