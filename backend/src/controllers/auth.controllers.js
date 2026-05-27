import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";
import { generateAccessToken, generateRefreshToken, sendTokenResponse } from "../utils/tokens.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email.js";
import crypto from "crypto";


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
    logger.info(`New user registered, but email is not verified yet: ${email}`);
    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailErr) {
      logger.error(`Verification email failed: ${emailErr.message}`);
    }

    return res.status(201).json({
      success: true,
      message: "Account created! Please check your email to verify your account.",
      data: { user: { _id: user._id, name: user.name, email: user.email, isVerified: false } },
    });
});


const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ success: false, message: "Verification token is missing" });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpiry: { $gt: Date.now() },
  }).select("+verificationToken +verificationTokenExpiry");

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Verification link is invalid or has expired. Please request a new one.",
    });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  logger.info(`Email verified for: ${user.email}`);
  return res.status(200).json({ success: true, message: "Email verified successfully! You can now log in." });
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select("+verificationToken +verificationTokenExpiry");

  if (!user || user.isVerified) {
    return res.status(200).json({
      success: true,
      message: "If that email exists and is unverified, a new link has been sent.",
    });
  }

  const verificationToken = user.generateVerificationToken();
  await user.save({ validateBeforeSave: false });
  await sendVerificationEmail(user, verificationToken);

  return res.status(200).json({ success: true, message: "Verification email resent." });
});


const signIn = asyncHandler(async (req, res) => {
  const { email, password, rememberMe = false } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.password || !(await user.comparePassword(password))) {
    logger.warn(`Failed login: ${email}`);
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email before logging in.",
      needsVerification: true,
    });
  }

  logger.info(`User logged in: ${email}`);
  await sendTokenResponse(user, 200, res, rememberMe);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpiry");

  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If that email exists, a password reset link has been sent.",
    });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, resetToken);
    logger.info(`Password reset email sent to: ${email}`);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ success: false, message: "Could not send reset email. Please try again." });
  }

  return res.status(200).json({
    success: true,
    message: "If that email exists, a password reset link has been sent.",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpiry");

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Reset link is invalid or has expired. Please request a new one.",
    });
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  user.refreshToken = null;
  await user.save();

  logger.info(`Password reset successful for: ${user.email}`);
  return res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
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
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
};