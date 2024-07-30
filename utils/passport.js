const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const generateToken = require("../utils/generateToken")
const User = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let userExists = await User.findOne({ email: profile.emails[0].value });

        if (!userExists) {
          // If user doesn't exist, create a new user
          const newUser = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            password: await bcrypt.hash(Date.now().toString(), 10),
          });
          userExists = await newUser.save();
        }

        console.log(userExists);


        // Generate token
        const token = generateToken(userExists._id);

        console.log(token)

        return done(null, userExists, token);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
