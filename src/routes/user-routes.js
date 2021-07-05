const { Router } = require("express");
const userService = require("../services/user-service");
const passport = require("passport");

const router = new Router();

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

router.get("/register", checkAuthed(false, "/"), (req, res, next) => {
  res.render("./pages/register", { _csrf: req.csrfToken() });
});

router.post("/register", checkAuthed(false, "/"), async (req, res, next) => {
  try {
    await userService.register(req.body);
    res.redirect("/login");
  } catch (err) {
    // set the flash error message to show to the user
    req.flash("error", err.message);
    res.redirect("/register");
  }
});

router.post("/logout", checkAuthed(true, "/login"), (req, res, next) => {
  req.logOut();
  res.redirect("/login");
});

router.get("/login", checkAuthed(false, "/"), (req, res, next) => {
  res.render("./pages/login", { _csrf: req.csrfToken() });
});

router.post(
  "/login",
  checkAuthed(false, "/"),
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

module.exports = router;
