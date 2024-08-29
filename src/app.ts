import cors from "cors";
import express, { Express, json, static as static_, urlencoded } from "express";

export const app: Express = express();

app.use(cors());

app.use(json({ limit: "20kb" })); // parse incoming req with JSON payloads. without this req.body = undefined
app.use(urlencoded({ extended: true, limit: "20kb" })); // for data sent using 'x-www-form-urlencoded'
app.use(static_("public")); // to serve static files, such as HTML/CSS/JS/Images, etc from public folder

import userRouter from "./routers/users.route";

app.use("/api/users", userRouter);
