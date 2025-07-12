const express =  require("express");
const router = express.Router();

const {Student} = require("../models/student");

router.get("/:id", (req, res) => {
  console.log(req.params.id);
  res.render("student");
})

module.exports = router;