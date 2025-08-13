const express = require("express");
const router = express.Router();
const { requireStudent } = require("../utils/auth");
const { Student, Fee, Marksheet, Attendance } = require("../models/student");

// Apply authentication middleware to all student routes
router.use(requireStudent);

router.get("/:id", async (req, res) => {
  try {
    // Verify that the student is accessing their own page
    if (req.params.id !== req.user.id) {
      return res.redirect("/login");
    }

    const student = await Student.findOne({ enrollmentNo: req.params.id });
    const fees = await Fee.find({ enrollmentNo: req.params.id });
    const attendances = await Attendance.find({ enrollmentNo: req.params.id });
    const marks = await Marksheet.find({ enrollmentNo: req.params.id, status: "Publish" });

    if (!student) {
      return res.status(404).render("error", { message: "Student not found" });
    }

    // Calculate statistics
    let attendanceRate = 0;
    let averageGrade = 0;
    let totalFeesPaid = 0;
    let pendingFees = 0;

    // Calculate attendance rate
    if (attendances.length > 0) {
      const totalPresent = attendances.reduce((sum, att) => sum + att.present, 0);
      const totalAbsent = attendances.reduce((sum, att) => sum + att.absent, 0);
      const totalDays = totalPresent + totalAbsent;
      attendanceRate = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
    }

    // Calculate average grade from marks
    if (marks.length > 0) {
      let totalPercentage = 0;
      let termCount = 0;
      
      marks.forEach(term => {
        if (term.subjects && term.subjects.length > 0) {
          const termTotal = term.subjects.reduce((sum, subj) => sum + subj.total, 0);
          const maxPossible = term.subjects.length * 100;
          const termPercentage = (termTotal / maxPossible) * 100;
          totalPercentage += termPercentage;
          termCount++;
        }
      });
      
      averageGrade = termCount > 0 ? Math.round((totalPercentage / termCount) * 10) / 10 : 0;
    }

    // Calculate fees statistics
    if (fees.length > 0) {
      totalFeesPaid = fees.reduce((sum, fee) => {
        return fee.status === 'Paid' ? sum + fee.total : sum;
      }, 0);
      
      pendingFees = fees.reduce((sum, fee) => {
        return fee.status === 'Pending' ? sum + fee.total : sum;
      }, 0);
    }

    // Get available terms for marksheet
    const availableTerms = marks.map(m => m.term);

    res.render("student", {
      student: student,
      user: req.user,
      fees: fees,
      marks: marks,
      stats: {
        attendanceRate,
        averageGrade,
        totalFeesPaid,
        pendingFees
      },
      availableTerms
    });
  } catch (error) {
    console.error("Student page error:", error);
    res.status(500).render("error", { message: "Internal server error" });
  }
});

module.exports = router;
