const express = require("express");
const router = express.Router();
const { requireTeacher } = require("../utils/auth");
const { Teacher } = require("../models/teacher");

// Apply authentication middleware to all teacher routes
router.use(requireTeacher);

router.get("/:id", async (req, res) => {
  try {
    // Verify that the teacher is accessing their own page
    if (req.params.id !== req.user.id) {
      return res.redirect('/login');
    }
    
    const teacher = await Teacher.findOne({ teacherId: req.params.id });
    if (!teacher) {
      return res.status(404).render("error", { message: "Teacher not found" });
    }
    
    res.render("teacher", { 
      teacher: teacher,
      user: req.user 
    });
  } catch (error) {
    console.error('Teacher page error:', error);
    res.status(500).render("error", { message: "Internal server error" });
  }
});

module.exports = router;