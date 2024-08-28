import cors from "cors";
import express, { Express } from "express";
import userRouter from "./routers/users.route";

export const app: Express = express();

app.use(cors());

app.use("/api/users", userRouter);
