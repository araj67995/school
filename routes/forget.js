const express =  require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("forget");
});

module.exports = router