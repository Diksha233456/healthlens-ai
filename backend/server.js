const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        callback(null, true); // Allow any origin in dev
    },
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: "Too many requests, please try again later." }
});
app.use(limiter);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const aiRoutes = require("./routes/aiRoutes");
const alertRoutes = require("./routes/alertRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/alerts", alertRoutes);

// Route Debugging
app.get("/api/debug-routes", (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) { // routes registered directly on the app
            routes.push(Object.keys(middleware.route.methods).join(', ').toUpperCase() + " " + middleware.route.path);
        } else if (middleware.name === 'router') { // router middleware
            middleware.handle.stack.forEach(handler => {
                if (handler.route) {
                    const path = middleware.regexp.source.replace('\\/?(?=\\/|$)', '').replace('^\\/', '/') + handler.route.path;
                    routes.push(Object.keys(handler.route.methods).join(', ').toUpperCase() + " " + path);
                }
            });
        }
    });
    res.json(routes);
});

// Health Check
app.get("/", (req, res) => {
    res.json({
        message: "HealthLens AI Backend Running 🚀",
        version: "2.0.0",
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
});

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 HealthLens AI Server running on port ${PORT}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});
