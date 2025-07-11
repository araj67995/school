const express = require("express");
const router = express.Router();  // ← invoke the Router function

const Admission = require("../../models/admission");
const Notice = require("../../models/notice");
const {Student} = require("../../models/student");
const {Teacher} = require("../../models/teacher");

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
      pendingAdmissions: pendingAdmissions
    });
  } catch (err) {
    console.error("Error loading admin dashboard:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
