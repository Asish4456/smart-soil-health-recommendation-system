require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const soilRoutes = require("./routes/soilRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*"
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://myAtlasDBUser:Asish4456@ac-kunba6w-shard-00-00.yt5ejy9.mongodb.net:27017,ac-kunba6w-shard-00-01.yt5ejy9.mongodb.net:27017,ac-kunba6w-shard-00-02.yt5ejy9.mongodb.net:27017/soilDB?ssl=true&replicaSet=atlas-8n5uxb-shard-0&authSource=admin&retryWrites=true&w=majority";
console.log("MONGODB_URI loaded:", MONGODB_URI ? "YES (length: " + MONGODB_URI.length + ")" : "NO");
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
});

// Routes
app.use("/api/soil", soilRoutes);

// Root Test Route
app.get("/", (req, res) => {
  res.send("🌱 Smart Soil Health API is running...");
});

// Health Check Route
app.get("/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    server: "ok",
    mongodbState: states[mongoose.connection.readyState] || "unknown",
    readyState: mongoose.connection.readyState,
    hasUri: !!process.env.MONGODB_URI,
    envUriLength: (process.env.MONGODB_URI || "").length
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});