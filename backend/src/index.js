import express from "express";
import mongoose from "mongoose";
import { createServer } from "http"; // to connect socket server and express server
import connectTosocket from "./controllers/socketManager.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";

const app = express();
const server = createServer(app);
connectTosocket(server); // attach socket.io server

app.set("port", process.env.PORT || 8000);

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// ✅ REQUEST LOGGER (Debugging)
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});

// ===== ROUTES =====
app.use("/api/v1/users", userRoutes);

// ✅ 404 HANDLER (For unknown routes)
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ✅ ERROR HANDLER (Catches thrown errors)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ===== START SERVER =====
const start = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://ketanmandave25:ketan12345@cluster0.qxpz5vc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("✅ Connected to MongoDB");

    server.listen(app.get("port"), () => {
      console.log(`🚀 Server is running on port ${app.get("port")}`);
    });
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  }
};

start();
