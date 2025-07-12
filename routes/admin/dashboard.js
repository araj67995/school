const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../../utils/auth");

const Admission = require("../../models/admission");
const Notice = require("../../models/notice");
const {Student} = require("../../models/student");
const {Teacher} = require("../../models/teacher");

// Apply authentication middleware to all admin routes
router.use(requireAdmin);

// Admin Routes
router.get("/", async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    const notices = await Notice.find().sort({ createdAt: -1 });
    const students = await Student.find();
    const teachers = await Teacher.find();
    const activeNotice = await Notice.find({ status: "Active" });
    const pendingAdmissions = await Admission.find({ status: "Pending" });

    res.render("admin/dashboard", {
      Admissions: admissions,
      Notice: notices,
      Students: students,
      Teachers: teachers,
      ActiveNotice: activeNotice,
      pendingAdmissions: pendingAdmissions,
      user: req.user
    });
  } catch (err) {
    console.error("Error loading admin dashboard:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
