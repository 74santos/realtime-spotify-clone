import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import fs from "fs"
import { initializeSocket } from "./lib/socket.js";
import {  createServer } from "http";
import cron from "node-cron"

import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";



dotenv.config();
const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 3001;

// ---------- Socket.io ----------
const httpServer = createServer(app)
initializeSocket(httpServer)

// ---------- CORS ----------
app.use(
  cors({
    origin: "https://realtime-spotify-clone-dze4.onrender.com", // frontend origin
    credentials: true,               // allow cookies / Authorization headers
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  })
);

// ---------- JSON parser ----------
app.use(express.json());

// ---------- Clerk middleware ----------
app.use(clerkMiddleware());

// ---------- File uploads ----------
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  })
);


const tempDir = path.join(process.cwd(), "tmp");
// cron jobs
// delete those files in every 1 hours
cron.schedule("0 * * * *", () => {
  if ( fs.existsSync(tempDir) ) {
    fs.readdir(tempDir, ( err, files ) => {
      if ( err ) {
        console.log("error",err)
        return
      }
      for (const file of files) {
        fs.unlink(path.join(tempDir, file), (err) => {})
      }
    });
  }
})




// ---------- Routes ----------
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

if(process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "frontend-dist");
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});

// ---------- Start server ----------
httpServer.listen(PORT, () => {
  console.log("Server running on port " + PORT);
  connectDB();
});
