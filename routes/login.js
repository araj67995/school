const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

router.get("/", (req, res) => {
  res.render("login", { message: "" });
});

router.post("/", async (req, res) => {
  const { id, password } = req.body;
  
  try {
    const user = await User.findOne({ id });
    
    if (!user) {
      return res.render("login", {
        message: "User not found! Contact your School.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.pass);

    if (!isMatch) {
      return res.render("login", {
        message: "Incorrect password.",
      });
    }

    // Set session data
    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.userName = user.name;

    let toRedirect = "";

    switch (user.role) {
      case "student":
        toRedirect = `/student/${id}`;
        break;

      case "teacher":
        toRedirect = `/teacher/${id}`;
        break;

      case "admin":
        toRedirect = `/admin`;
        break;

      default:
        return res.render("login", {
          message: "Error! Please try again.",
        });
    }

    res.redirect(toRedirect);
  } catch (error) {
    console.error('Login error:', error);
    return res.render("login", {
      message: "An error occurred. Please try again.",
    });
  }
});

// Logout route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
