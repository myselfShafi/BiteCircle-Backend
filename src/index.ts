import dotenv from "dotenv";
import { app } from "./app";
import connectToDB from "./config/db";

dotenv.config({ path: "./.env" });

const port = process.env.PORT;

connectToDB()
  .then(() =>
    app.listen(port, () => {
      console.log(`Server running at port : ${port}`);
    })
  )
  .catch((error) => {
    console.log("MONGO db connection failed !!! ", error);
  });
