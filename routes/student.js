const express = require("express");
const router = express.Router();
const { requireStudent } = require("../utils/auth");
const { Student } = require("../models/student");

// Apply authentication middleware to all student routes
router.use(requireStudent);

router.get("/:id", async (req, res) => {
  try {
    // Verify that the student is accessing their own page
    if (req.params.id !== req.user.id) {
      return res.redirect('/login');
    }
    
    const student = await Student.findOne({ enrollmentNo: req.params.id });
    if (!student) {
      return res.status(404).render("error", { message: "Student not found" });
    }
    
    res.render("student", { 
      student: student,
      user: req.user 
    });
  } catch (error) {
    console.error('Student page error:', error);
    res.status(500).render("error", { message: "Internal server error" });
  }
});

module.exports = router;