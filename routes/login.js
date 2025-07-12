const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

router.get("/", (req, res) => {
  res.render("login", { message: "" });
});

router.post("/", async (req, res) => {
  const { id, password } = req.body;
  const user = await User.findOne({ id});
  const role =user.role;

  const isMatch = await bcrypt.compare(password, user.pass);

  if (!user) {
    return res.render("login", {
      message: "User not found! Contact your School.",
    });
  }

  if (!isMatch) {
    return res.render("login", {
      message: "Incorrect password.",
    });
  }

  let toRedirect = "";

  switch (role) {
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
});

module.exports = router;
