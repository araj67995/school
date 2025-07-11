const express =  require("express");
const router = express.Router();

router.get("/forget", (req, res) => {
  res.render("forget");
});

module.exports = router