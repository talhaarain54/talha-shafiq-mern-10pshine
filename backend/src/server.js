import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import "./config/passport.js";
import passport from "passport";
import pinoHTTP from 'pino-http';
import logger from './utils/logger.js';
import errorHandler from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/note.routes.js";


const app = express();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// middlewares
app.use(cors({ 
  origin: process.env.FRONTEND_URL, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
if (process.env.NODE_ENV !== 'test') {
  app.use(pinoHTTP({ logger }));
}

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again in 15 minutes." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, please try again in 15 minutes." },
  skipSuccessfulRequests: true,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: "Too many password reset requests. Please try again in an hour." },
});

app.use("/api", generalLimiter);
app.use("/api/v1/auth/signin", authLimiter);
app.use("/api/v1/auth/signup", authLimiter);
app.use("/api/v1/auth/forgot-password", forgotPasswordLimiter);


// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notes", notesRoutes);


// Global error handler middleware
app.use(errorHandler);

app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: "Server is okay"
  });
});


const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

export default app;