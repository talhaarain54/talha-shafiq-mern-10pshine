import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import "./config/passport.js";
import passport from "passport";
import pinoHTTP from 'pino-http';
import logger from './utils/logger.js';
import errorHandler from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

connectDB();

// middlewares
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(pinoHTTP({ logger }));


// Routes
app.use("/api/v1/auth", authRoutes);

// Global error handler middleware
app.use(errorHandler);

app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});