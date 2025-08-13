const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { sendPasswordChangeOtp } = require("../utils/mail.js");

const saltRounds = 10;
const User = require("../models/user");
const { set } = require("mongoose");

router.get("/", async (req, res) => {
  const user = await User.find();

  res.render("forget", { user: user });
});

router.post("/newPass", async (req, res) => {
  const { newPassword, id } = req.body;
  const pass = await bcrypt.hash(newPassword, saltRounds);

  const user = await User.findOneAndUpdate({ id: id }, { pass });

  res.redirect("/login");
});

router.post("/send-otp", async (req, res) => {
  const { email, otp, name } = req.body;
  await sendPasswordChangeOtp(email, otp, name);
  res.status(200).json({ message: "OTP sent successfully" });
});

module.exports = router;
