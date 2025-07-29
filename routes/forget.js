const express =  require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const saltRounds = 10;
const User = require("../models/user");

router.get("/", async(req, res) => {
  
  const user = await User.find();

  res.render("forget", {user: user});
});

router.post("/newPass", async(req, res) => {
  const {newPassword, id} = req.body;

  console.log(id, newPassword);
})

module.exports = router