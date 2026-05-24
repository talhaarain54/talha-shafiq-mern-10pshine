import jwt from "jsonwebtoken";

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

const generateRefreshToken = (id, rememberMe = false) => {
  const expiresIn = rememberMe ? "30d" : (process.env.JWT_REFRESH_EXPIRES_IN || "7d");
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn });
};

const sendTokenResponse = async (user, statusCode, res, rememberMe = false) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id, rememberMe);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieMaxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 7 * 24 * 60 * 60 * 1000;

  res.cookie("refreshToken", refreshToken, {
    expires: new Date(Date.now() + cookieMaxAge),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });

  res.status(statusCode).json({
    status: "success",
    accessToken,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    },
  });
};

export { generateAccessToken, generateRefreshToken, sendTokenResponse };