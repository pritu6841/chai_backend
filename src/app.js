import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
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

export default app