import { readdirSync, stat, unlinkSync } from "fs";
import cron from "node-cron";
import { join } from "path";
import ApiError from "./helpers/ApiError";

const handleCleanMedia = async () => {
  let folderPath = join("./", "public", "temp-media");
  try {
    const fileDirectory: string[] = readdirSync(folderPath).filter(
      (file: string) => file !== ".gitkeep"
    );

    if (fileDirectory.length === 0) return;

    fileDirectory.forEach((file: string) => {
      let filePath = join(folderPath, file);
      stat(filePath, (err, stat) => {
        if (err) {
          throw new ApiError(500, "Media file stats error!" + err);
        }
        let fileAge = (Date.now() - stat.mtime.getTime()) / (1000 * 60); //last modified time of the media file
        if (fileAge < 10) return;
        unlinkSync(filePath);
      });
    });
  } catch (error) {
    throw new ApiError(500, "Auto-clean server temp. media failed!" + error);
  }
};

cron.schedule("10 * * * *", handleCleanMedia);
