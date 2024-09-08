import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express, json, static as static_, urlencoded } from "express";
import "./utils/cleanTempMedia";

export const app: Express = express();

app.use(cors());

app.use(json({ limit: "20kb" })); // parse incoming req with JSON payloads. without this req.body = undefined
app.use(urlencoded({ extended: true, limit: "20kb" })); // for data sent using 'x-www-form-urlencoded'
app.use(static_("public")); // to serve static files, such as HTML/CSS/JS/Images, etc from public folder
app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names

import commentRouter from "./routers/comments.route";
import followRouter from "./routers/follows.route";
import LikeRouter from "./routers/likes.route";
import postRouter from "./routers/posts.route";
import userRouter from "./routers/users.route";

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/likes", LikeRouter);
app.use("/api/follows", followRouter);
