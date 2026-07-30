const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const activityRoutes = require("./routes/activityRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const aiRoutes = require("./ai/ai.routes");

// Controllers for TRD aliases
const { getStats, getFavorites } = require("./controllers/itemController");
const { protect } = require("./middleware/auth");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount endpoints
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ai", aiRoutes);

// TRD Endpoint Aliases
app.get("/api/dashboard", protect, getStats);
app.get("/api/analytics", protect, getStats);
app.get("/api/favorites", protect, getFavorites);
app.get("/", (req, res) => {
  res.send("MediaShelf Backend is running 🚀");
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res
    .status(500)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
