const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../../utils/auth");

const Notice = require("../../models/notice");

// Apply authentication middleware to all admin notice routes
router.use(requireAdmin);

// Notice Section
router.get("/", (req, res) => {
  Notice.find()
    .sort({ createdAt: -1 })
    .then((found) => {
      res.render("admin/notice", {
        Notice: found,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Add Notice
router.post("/addNotice", (req, res) => {
  const { title, date, status, remark } = req.body;

  const notice = new Notice({
    title,
    date,
    remark,
    status,
  });

  notice
    .save()
    .then(() => {
      res.redirect("/admin/notice");
    })
    .catch((err) => {
      console.log(err);
    });
});

// Edit or Delete Notice
router.post("/editNotice", (req, res) => {
  const { btn } = req.body;
  const [_id, to, status] = btn.split(",");

  if (to === "edit") {
    const newStatus = status === "Active" ? "Inactive" : "Active";

    Notice.findOneAndUpdate({ _id }, { status: newStatus })
      .then(() => {
        res.redirect("/admin/notice");
      })
      .catch((err) => {
        console.log("Edit error:", err);
        res.status(500).send("Failed to update notice.");
      });
  } else if (to === "delete") {
    // Delete notice
    Notice.findByIdAndDelete(_id)
      .then(() => {
        res.redirect("/admin/notice");
      })
      .catch((err) => {
        console.log("Delete error:", err);
        res.status(500).send("Failed to delete notice.");
      });
  } else {
    res.status(400).send("Invalid action.");
  }
});

module.exports = router;