import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ApiError from "../utils/helpers/ApiError";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UploadMediaToCloudinary = async (localMediaFilePath: string) => {
  try {
    if (!localMediaFilePath) return;
    const uploadedFile = await cloudinary.uploader.upload(localMediaFilePath, {
      resource_type: "auto",
    });

    const transformedUrl = cloudinary.url(uploadedFile.public_id, {
      transformation: [
        {
          fetch_format: "auto",
          quality: "auto",
        },
      ],
    });
    fs.unlinkSync(localMediaFilePath);
    return { url: transformedUrl, publicId: uploadedFile.public_id };
  } catch (error: any) {
    fs.unlinkSync(localMediaFilePath);
    throw new ApiError(500, "cloudinary upload error : ", error);
  }
};

const DeleteMediaFromCloudinary = async (publicId: string) => {
  try {
    if (!publicId) return;
    const deletedFile = await cloudinary.uploader.destroy(publicId, {
      type: "upload",
    });
    return deletedFile;
  } catch (error: any) {
    throw new ApiError(500, "cloudinary delete error : ", error);
  }
}; // handle media removal from cloudinary on file update/ deletion

export { DeleteMediaFromCloudinary, UploadMediaToCloudinary };
