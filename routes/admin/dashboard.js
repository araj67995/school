const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../../utils/auth");

const Admission = require("../../models/admission");
const Notice = require("../../models/notice");
const {Student} = require("../../models/student");
const {Teacher, TeacherLeave, TeacherAttendance} = require("../../models/teacher");

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
    const TeacherLeaves =  await TeacherLeave.find().sort({createdAt: -1});

    res.render("admin/dashboard", {
      Admissions: admissions,
      Notice: notices,
      Students: students,
      Teachers: teachers,
      ActiveNotice: activeNotice,
      pendingAdmissions: pendingAdmissions,
      user: req.user,
      TeacherLeaves: TeacherLeaves,
    });
  } catch (err) {
    console.error("Error loading admin dashboard:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Leave management routes
router.post("/teacher-leave/approve", async (req, res) => {
   const { leaveId, status, remark } = req.body; // status: Approved/Rejected
  try {
    const leave = await TeacherLeave.findById(leaveId);
    if (!leave)
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });

    leave.status = status;
    leave.remark = remark;
    await leave.save();

    // If approved, mark attendance as Leave for all dates in range
    if (status === "Approved") {
      let current = new Date(leave.fromDate);
      const end = new Date(leave.toDate);
      while (current <= end) {
        const dateStr = current.toISOString().slice(0, 10);
        let att = await TeacherAttendance.findOne({
          teacherId: leave.teacherId,
          date: dateStr,
        });
        if (!att) {
          att = new TeacherAttendance({
            teacherId: leave.teacherId,
            date: dateStr,
            status: "Leave",
            remark: leave.reason,
            approved: true,
          });
        } else {
          att.status = "Leave";
          att.remark = leave.reason;
          att.approved = true;
        }
        await att.save();
        current.setDate(current.getDate() + 1);
      }
    }

    // ✅ Delete the leave record after processing
    await TeacherLeave.findByIdAndDelete(leaveId);

    res.json({ success: true, message: `Leave ${status.toLowerCase()}` });
  } catch (err) {
    console.error("Error approving/rejecting leave:", err);
    res
      .status(500)
      .json({ success: false, message: "Error updating leave status" });
  }
});

// Get all leave applications for admin dashboard
router.get("/leaves", async (req, res) => {
  try {
    const leaves = await TeacherLeave.find()
      .sort({ createdAt: -1 });
    
    // Get teacher details for each leave
    const leavesWithTeacherDetails = await Promise.all(
      leaves.map(async (leave) => {
        const teacher = await Teacher.findOne({ teacherId: leave.teacherId });
        return {
          ...leave.toObject(),
          teacherDetails: teacher ? { name: teacher.name, teacherId: teacher.teacherId } : null
        };
      })
    );
    
    res.json({ success: true, leaves: leavesWithTeacherDetails });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
