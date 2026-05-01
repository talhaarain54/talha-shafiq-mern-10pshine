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

// Google OAuth routes
router.get("/google", passport.authenticate("google", {scope: ["profile", "email"]}));
router.get("/google/callback", passport.authenticate("google", { session: false }), googleSuccess);

export default router;