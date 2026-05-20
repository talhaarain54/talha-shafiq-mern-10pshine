import e from "express";
import validate from "../middlewares/validate.middleware.js";
import { signInSchema, signUpSchema } from "../validations/auth.validation.js";
import { getMe, googleSuccess, refreshAccessToken, signIn, signUp } from "../controllers/auth.controllers.js";
import passport from "passport";
import { protect } from "../middlewares/auth.middleware.js";


const router = e.Router();


router.post("/signup", validate(signUpSchema), signUp);
router.post("/signin", validate(signInSchema), signIn);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/change-password", protect, validate(changePasswordSchema), changePassword);
router.put("/update-profile", protect, validate(updateProfileSchema), updateProfile);

// Google OAuth routes
router.get("/google", passport.authenticate("google", {scope: ["profile", "email"]}));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`, }), googleSuccess);

export default router;