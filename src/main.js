require("dotenv").config();
const express = require("express");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const redis = require("redis");
const methodOverride = require("method-override");
const initializePassport = require("./passport-config");
const { handleError, APIError } = require("./shared/error-handling");
const userService = require("./services/user-service");
const { UserModel } = require("./services/models/user");

initializePassport(
  passport,
  (username) => {
    return UserModel.getByUsername(username);
  },
  (id) => {
    return UserModel.getByID(id);
  }
);

// sets simple view engine to be ejs
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(cookieParser());
// session storage uses redis to save session data
const redisClient = redis.createClient({
  host: process.env.REDIS_IP,
  port: process.env.REDIS_PORT,
});
const redisStore = require("connect-redis")(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    // redis config
    store: new redisStore({
      client: redisClient,
    }),
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());

// only set this up if starting in dev mode
if (process.env.ENVIORNMENT === "dev") {
  console.log("Starting Server in dev mode");

  app.use(require("morgan")("dev"));
}

/**
 * Helper middleware for blocking users based on auth status
 * @param {boolean} authed - the user needs to be authed to continue
 * @param {string} redirect - redirect user to this path on failure
 */
function checkAuthed(authed, redirect) {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return authed ? next() : res.redirect(redirect);
    }
    return authed ? res.redirect(redirect) : next();
  };
}

app.get("/", checkAuthed(true, "/login"), (req, res, next) => {
  res.render("./pages/home", { user: req.user });
});

app.get("/register", checkAuthed(false, "/"), (req, res, next) => {
  res.render("./pages/register");
});

app.post("/register", checkAuthed(false, "/"), async (req, res, next) => {
  try {
    await userService.register(req.body);
    res.redirect("/login");
  } catch (err) {
    // set the flash error message to show to the user
    req.flash("error", err.message);
    res.redirect("/register");
  }
});

app.post("/logout", checkAuthed(true, "/login"), (req, res, next) => {
  req.logOut();
  res.redirect("/login");
});

app.get("/login", checkAuthed(false, "/"), (req, res, next) => {
  res.render("./pages/login");
});

app.post(
  "/login",
  checkAuthed(false, "/"),
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.use((req, res, next) => {
  next(
    new APIError(404, `Route not available ${req.method} :${req.originalUrl}:`)
  );
});

app.use((err, req, res, next) => {
  // handleError(err, res);
  res.render("./pages/error", {
    error: err,
  });
});

module.exports = app;
