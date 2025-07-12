const express =  require("express");
const router = express.Router();

const {Teacher} = require("../models/teacher");

router.get("/:id", (req, res) => {
  console.log(req.params.id);
  res.render("teacher");
})

module.exports = router;