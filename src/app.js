import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";


const tempDir = path.join(process.cwd(), "public", "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log("Upload directory created:", tempDir);
}
const app = express()
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))

app.use(express.json({
  limit: "16kb"
}))

app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public")) // for serving static files from public directory
app.use(cookieParser())//mere server se user ke browser se cookies ko access karne ke liye

// routes import
import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/users/register

export default app