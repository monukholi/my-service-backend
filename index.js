var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const express_session = require("express-session");
var app = express();
var indexRouter = require("./routes/app");
var userModel = require("./routes/users");
const passport = require("passport");
require("dotenv").config();
const flash = require("connect-flash");

const mongoDB = require("./config/mongodb");

mongoDB();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(flash());

app.use(
  express_session({
    resave: false,
    saveUninitialized: false,
    secret: "this is my app",
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter.router);
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login", { error: req.flash("error") });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/profile", indexRouter.isLoggedIn, async (req, res) => {
  try {
    const userData = await userModel.findOne({
      username: req.session.passport.user,
    });
    res.render("profile", { user: userData });
  } catch (err) {
    console.log(err);
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Server started !");
});

module.exports = app;
