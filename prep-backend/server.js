require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");

const connectDB = require("./config/db");

// Route modules
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");

// Middleware and controller imports
const { protect } = require("./middlewares/authMiddleware");
const {
  generateInverviewQuestions,
  generateConceptExplanation,
} = require("./controllers/aiController");

const app = express();

// ====== Database Connection ======
connectDB();

// ====== Middleware ======
// Compression for responses
app.use(compression());

// JSON parsing
app.use(express.json());

// CORS setup
const allowedOrigins = [process.env.CLIENT_URL];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ====== Health Check Route ======
app.get("/", (req, res) => {
  res.send("Backend is working.");
});

// ====== API Routes ======
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);

app.use("/api/ai/generate-questions", protect, generateInverviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);

// ====== Static Files ======
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// ====== Error Handling ======
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Something went wrong" });
});

// ====== Start Server ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
