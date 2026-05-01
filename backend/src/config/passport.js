import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.model.js"; 
import logger from "../utils/logger.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/google/callback"
}, 
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const isEmailVerified = profile.emails[0].verified; 

        let user = await User.findOne({ email });

        // Account already exists and is linked to Google
        if (user && user.googleId) {
            logger.info(`Google Login successful: ${email}`);
            return done(null, user);
        }

        // Account exists (Email/Pass) but NOT linked to Google
        if (user && !user.googleId) {
            if (isEmailVerified) {
                user.googleId = profile.id;
                await user.save({ validateBeforeSave: false }); 
                logger.info(`Third Condition Met: Linked existing email account to Google: ${email}`);
                return done(null, user);
            } else {
                logger.warn(`Link rejected: Unverified Google email for existing account: ${email}`);
                return done(new Error("Please verify your Google email before linking."), null);
            }
        }

        // No account exists, Create New one
        user = await User.create({
            name: profile.displayName,
            email: email,
            googleId: profile.id
        });
        
        logger.info(`New OAuth User Created: ${user.email}`);
        return done(null, user);

    } catch (err) {
        logger.error(`OAuth Strategy Error: ${err.message}`);
        return done(err, null);
    }
}));