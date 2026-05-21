import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";
import { generateAccessToken, generateRefreshToken, sendTokenResponse } from "../utils/tokens.js";
import jwt from "jsonwebtoken";

const signUp = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        logger.warn(`Signup attempt with existing email: ${email}`);
        return res.status(400).json({
            success: false,
            errors: [
                {
                    field: "email",
                    message: "Email already registered",
                },
            ],
        });
    }

    const user = await User.create({ name, email, password });
    logger.info(`New user registered: ${email}`);
    await sendTokenResponse(user, 201, res);
})


const signIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password || !(await user.comparePassword(password))) {
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
        const accessToken = generateAccessToken(req.user._id);
        const refreshToken = generateRefreshToken(req.user._id);

        req.user.refreshToken = refreshToken;
        await req.user.save({ validateBeforeSave: false });

        res.cookie("refreshToken", refreshToken, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
        });

        res.redirect(
            `${process.env.FRONTEND_URL}/login-success?token=${accessToken}`,
        );
    }
});


const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token provided" });

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
        logger.warn(`Refresh token theft attempt or mismatch: ${decoded.id}`);
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
     
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const newAccessToken = generateAccessToken(user._id);
    res.status(200).json({ accessToken: newAccessToken });
});


const getMe = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        data: req.user,
    });
});


const logout = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(200).json({
      success: true,
      message: "Already logged out",
    });
  }

  const user = await User.findOne({ refreshToken: token });

  if (user) {
    user.refreshToken = null;
    await user.save();
  } else {
    logger.warn("Logout attempt with invalid refresh token");
  }

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  };
  res.cookie("refreshToken", "", cookieOptions);

  logger.info("User logged out: cookies cleared");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const { name, email } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if email already exists
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    user.email = email;
  }

  if (name) user.name = name;

  await user.save();

  logger.info(`User updated profile: ${user.email}`);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    },
  });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(userId).select("+password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    logger.warn(`Wrong password attempt: ${user.email}`);
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  user.password = newPassword;

  await user.save();

  logger.info(`User changed password: ${user.email}`);

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});


export {
    signUp,
    signIn,
    googleSuccess,
    refreshAccessToken,
    getMe,
    logout,
    updateProfile,
    changePassword,
};