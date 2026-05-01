import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";
import { generateAccessToken, sendTokenResponse } from "../utils/tokens.js";
import jwt from "jsonwebtoken";

const signUp = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    logger.info(`New user registered: ${email}`);
    await sendTokenResponse(user, 201, res);
})


const signIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        logger.warn(`Failed login attempt for: ${email}`);
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    await sendTokenResponse(user, 200, res);
});


const googleSuccess = asyncHandler(async (req, res, next) => {
    if (req.user) {
        await sendTokenResponse(req.user, 200, res);
    }
});


const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
        logger.warn(`Refresh token theft attempt or mismatch: ${decoded.id}`);
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.status(200).json({ accessToken: newAccessToken });
});


const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user,
    });
});


export {
    signUp,
    signIn,
    googleSuccess,
    refreshAccessToken,
    getMe
}