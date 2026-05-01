import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } 
    // Fallback: Check Cookies 
    else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        logger.warn("Unauthorized access attempt: No token found in headers or cookies");
        return res.status(401).json({ success: false, error: "Not authorized, please login" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        next();
    } catch (err) {
        logger.error(`Auth Error: ${err.message}`);
        res.status(401).json({ success: false, error: "Token expired or invalid" });
    }
});

export { protect };