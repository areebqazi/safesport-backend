import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
// import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import videoRouter from "./routes/videoRouter.js";
import cors from 'cors'
import bodyParser from 'body-parser'
dotenv.config();

const app = express();
app.use(cors())
app.use(bodyParser.json({ limit: '5mb' }));
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error:", err);
  });

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/videos", videoRouter);



