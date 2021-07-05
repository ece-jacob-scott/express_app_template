require("dotenv").config();
import express from "express";
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
import redis from "redis";
const initializePassport = require("./passport-config");
const { APIError } = require("./shared/error-handling");
const { UserModel } = require("./services/models/user");
const userRoutes = require("./routes/user-routes");

// sets simple view engine to be ejs
app.set("view engine", "ejs");
app.use(require("helmet")());
// I don't have any of these files so send 204
app.get("/favicon.ico", (req, res, next) => {
  res.status(204);
});
app.get("/service-worker.js", (req, res, next) => {
  res.status(204);
});
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
app.use(
  require("csurf")({
    cookie: {
      sameSite: true,
      maxAge: 3600,
      httpOnly: true,
      secure: process.env.ENVIRONMENT === "prod",
    },
  })
);
// passport initialization
initializePassport(
  passport,
  (username) => {
    return UserModel.getByUsername(username);
  },
  (id) => {
    return UserModel.getByID(id);
  }
);
app.use(passport.initialize());
app.use(passport.session());

// only set this up if starting in dev mode
if (process.env.ENVIRONMENT === "dev") {
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
  res.render("./pages/home", { user: req.user, _csrf: req.csrfToken() });
});

app.use(userRoutes);

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
