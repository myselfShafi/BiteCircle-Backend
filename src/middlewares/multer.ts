import multer, { StorageEngine } from "multer";

const storage: StorageEngine = multer.diskStorage({
  destination: function (
    _,
    __,
    cb: (error: Error | null, filename: string) => void
  ) {
    cb(null, "./public/temp-media");
  },
  filename: function (
    _,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    cb(null, `biteCircle - ` + Date.now() + file.originalname);
  },
});

const handleUpload = multer({ storage });

export default handleUpload;
