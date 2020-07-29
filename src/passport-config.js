const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function passportInit(passport, getUserByUsername, getUserByID) {
  // TODO: rewrite with mysql
  const verifyUser = async (username, password, done) => {
    try {
      const user = await getUserByUsername(username);

      // user is an array
      if (user.length === 0) {
        return done(null, false, { message: "user was not found" });
      } else if (user.length != 1) {
        return done(null, false, { message: "too many users found" });
      }

      const isSamePassword = await user[0].checkPass(password);

      if (!isSamePassword) {
        return done(null, false, { message: "password was incorrect" });
      }
      return done(null, user[0]);
    } catch (err) {
      return done(err);
    }
  };

  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      verifyUser
    )
  );
  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });
  passport.deserializeUser(async (userID, done) => {
    try {
      const user = await getUserByID(userID);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = passportInit;
