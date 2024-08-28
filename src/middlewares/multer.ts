import multer, { StorageEngine } from "multer";

const storage: StorageEngine = multer.diskStorage({
  destination: (_, __, cb: (error: Error | null, filename: string) => void) => {
    cb(null, "./public/temp-media");
  },
  filename: (
    _,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, `biteCircle - ` + file.originalname);
  },
});

const handleUpload = multer({ storage });

export default handleUpload;
