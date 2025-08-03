require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { requireAdmin } = require("../../utils/auth");
const {transporter, sendPasswordTeacher} = require("../../utils/mail");

const saltRounds = 10;

const {
  Teacher,
  TeacherAttendance,
  TeacherLeave,
  TeacherSalary,
} = require("../../models/teacher");
const User = require("../../models/user");
const {
  genrateTeacherId,
  generateCredentials,
} = require("../../utils/helpers");

// Apply authentication middleware to all admin teacher routes
router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const teacher = await Teacher.find();
    // Fetch all teacher leave applications
    const teacherLeaves = await TeacherLeave.find().sort({ createdAt: -1 });
    res.render('admin/teacher', { teacher, teacherLeaves });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Add teacher
router.post("/addTeacher", async (req, res) => {
  const {
    name,
    father,
    mother,
    dob,
    gender,
    grade,
    section,
    previousWorking,
    contact,
    email,
    salary,
    experience,
    address,
    subject,
  } = req.body;
  const teacherId = await genrateTeacherId();

  const teacher = new Teacher({
    teacherId,
    name,
    dob,
    gender,
    email,
    contact,
    address,
    grade,
    section,
    previousWorking,
    father,
    mother,
    experience,
    salary,
    subject,
  });

  teacher
    .save()
    .then(() => {
      res.redirect("/admin/teacher");
    })
    .catch((err) => {
      console.log(err);
    });
});

// Teacher applies for leave
router.post("/apply-leave", async (req, res) => {
  const { teacherId, fromDate, toDate, reason } = req.body;
  try {
    const leave = new TeacherLeave({ teacherId, fromDate, toDate, reason });
    await leave.save();
    res
      .status(200)
      .json({ success: true, message: "Leave applied successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error applying leave" });
  }
});

// Get teacher attendance and leaves for a month
router.get("/teacher-attendance/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  const { month } = req.query; // YYYY-MM
  console.log(
    `Fetching attendance for teacher ${teacherId} for month ${month}`
  );
  try {
    // Get all attendance records for the month
    const attendance = await TeacherAttendance.find({
      teacherId,
      date: { $regex: `^${month}` },
    });
    console.log(`Found ${attendance.length} attendance records`);

    // Get all leave requests overlapping this month
    const leaves = await TeacherLeave.find({
      teacherId,
      $or: [
        { fromDate: { $regex: `^${month}` } },
        { toDate: { $regex: `^${month}` } },
        {
          $and: [
            { fromDate: { $lte: `${month}-31` } },
            { toDate: { $gte: `${month}-01` } },
          ],
        },
      ],
    });
    console.log(`Found ${leaves.length} leave records`);

    res.json({ attendance, leaves });
  } catch (err) {
    console.error("Error fetching attendance/leaves:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching attendance/leaves" });
  }
});

// Mark or edit teacher attendance for a date
router.post("/teacher-attendance/mark", async (req, res) => {
  const { teacherId, date, status, remark } = req.body;
  console.log(
    `Marking attendance for teacher ${teacherId} on ${date}: ${status}`
  );
  try {
    let record = await TeacherAttendance.findOne({ teacherId, date });
    if (!record) {
      record = new TeacherAttendance({ teacherId, date, status, remark });
      console.log("Creating new attendance record");
    } else {
      record.status = status;
      record.remark = remark;
      record.approved = false;
      console.log("Updating existing attendance record");
    }
    await record.save();
    console.log("Attendance saved successfully");
    res.json({ success: true, message: "Attendance marked/updated" });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res
      .status(500)
      .json({ success: false, message: "Error marking attendance" });
  }
});

// Delete teacher attendance for a date
router.delete("/teacher-attendance/delete", async (req, res) => {
  const { teacherId, date } = req.body;
  console.log(`Deleting attendance for teacher ${teacherId} on ${date}`);
  try {
    const result = await TeacherAttendance.deleteOne({ teacherId, date });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found" });
    }
    console.log("Attendance deleted successfully");
    res.json({ success: true, message: "Attendance deleted successfully" });
  } catch (err) {
    console.error("Error deleting attendance:", err);
    res
      .status(500)
      .json({ success: false, message: "Error deleting attendance" });
  }
});

// Approve or reject a leave request
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

// Get teacher salary history
router.get("/teacher-salary/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const salaries = await TeacherSalary.find({ teacherId }).sort({
      month: -1,
    });
    res.json({ success: true, salaries });
  } catch (err) {
    console.error("Error fetching salary history:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching salary history" });
  }
});

// Update teacher class
router.post("/update-class", async (req, res) => {
  console.log('Update class endpoint called');
  console.log('Request body:', req.body);
  
  const { teacherId, newGrade, newSection, changeReason } = req.body;
  
  if (!teacherId || !newGrade || !newSection) {
    console.log('Missing required fields');
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: teacherId, newGrade, newSection" 
    });
  }
  
  try {
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      console.log('Teacher not found:', teacherId);
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    console.log('Found teacher:', teacher.name);

    // Store old values for history
    const oldGrade = teacher.grade;
    const oldSection = teacher.section;

    // Update teacher's class and section
    teacher.grade = newGrade;
    teacher.section = newSection;
    await teacher.save();

    console.log(`Teacher ${teacherId} class changed from ${oldGrade}-${oldSection} to ${newGrade}-${newSection}. Reason: ${changeReason}`);

    res.json({ success: true, message: "Class updated successfully" });
  } catch (err) {
    console.error("Error updating teacher class:", err);
    res.status(500).json({ success: false, message: "Error updating class" });
  }
});

// Update teacher section
router.post("/update-section", async (req, res) => {
  console.log('Update section endpoint called');
  console.log('Request body:', req.body);
  
  const { teacherId, newSection, changeReason } = req.body;
  
  if (!teacherId || !newSection) {
    console.log('Missing required fields');
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: teacherId, newSection" 
    });
  }
  
  try {
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      console.log('Teacher not found:', teacherId);
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    console.log('Found teacher:', teacher.name);

    // Store old value for history
    const oldSection = teacher.section;

    // Update teacher's section
    teacher.section = newSection;
    await teacher.save();

    console.log(`Teacher ${teacherId} section changed from ${oldSection} to ${newSection}. Reason: ${changeReason}`);

    res.json({ success: true, message: "Section updated successfully" });
  } catch (err) {
    console.error("Error updating teacher section:", err);
    res.status(500).json({ success: false, message: "Error updating section" });
  }
});

// Add new class assignment
router.post("/add-class", async (req, res) => {
  const { teacherId, grade, section, subject, effectiveFrom, remarks } = req.body;
  try {
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // For now, we'll just log the additional class assignment
    // In a full implementation, you might want to create a separate model for multiple class assignments
    console.log(`Additional class assignment for teacher ${teacherId}: ${grade}-${section} (${subject || 'Same subject'}) effective from ${effectiveFrom}. Remarks: ${remarks}`);

    res.json({ success: true, message: "Class assignment added successfully" });
  } catch (err) {
    console.error("Error adding class assignment:", err);
    res.status(500).json({ success: false, message: "Error adding class assignment" });
  }
});

// Get additional classes for a teacher
router.get("/additional-classes/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  try {
    // For now, return empty array since we haven't implemented multiple class assignments yet
    // In a full implementation, you would query a separate model for additional class assignments
    res.json({ success: true, classes: [] });
  } catch (err) {
    console.error("Error fetching additional classes:", err);
    res.status(500).json({ success: false, message: "Error fetching additional classes" });
  }
});

// Get class history for a teacher
router.get("/class-history/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  try {
    // For now, return empty array since we haven't implemented class history tracking yet
    // In a full implementation, you would query a separate model for class change history
    res.json({ success: true, history: [] });
  } catch (err) {
    console.error("Error fetching class history:", err);
    res.status(500).json({ success: false, message: "Error fetching class history" });
  }
});

// Remove class assignment
router.post("/remove-class", async (req, res) => {
  const { classId } = req.body;
  try {
    // For now, just return success since we haven't implemented multiple class assignments yet
    // In a full implementation, you would delete the class assignment from a separate model
    console.log(`Removing class assignment with ID: ${classId}`);
    
    res.json({ success: true, message: "Class assignment removed successfully" });
  } catch (err) {
    console.error("Error removing class assignment:", err);
    res.status(500).json({ success: false, message: "Error removing class assignment" });
  }
});

// Generate salary for a teacher for a specific month
router.post("/teacher-salary/generate", async (req, res) => {
  const { teacherId, month, year } = req.body; // month: YYYY-MM
  try {
    // Check if salary already exists for this month
    const existingSalary = await TeacherSalary.findOne({ teacherId, month });
    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message: "Salary already generated for this month",
      });
    }

    // Get teacher details
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    // Get attendance for the month
    const attendance = await TeacherAttendance.find({
      teacherId,
      date: { $regex: `^${month}` },
    });

    // Calculate attendance statistics
    const attendanceStats = {
      Present: 0,
      Absent: 0,
      "Half Day": 0,
      Leave: 0,
    };

    attendance.forEach((record) => {
      if (attendanceStats.hasOwnProperty(record.status)) {
        attendanceStats[record.status]++;
      }
    });

    // Calculate salary (basic salary + allowances - deductions)
    const basicSalary = teacher.salary;
    const allowances = 0; // Can be customized
    const deductions = 0; // Can be customized based on attendance
    const netSalary = basicSalary + allowances - deductions;

    // Create salary record
    const salary = new TeacherSalary({
      teacherId,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      netSalary,
      attendanceDays: attendanceStats.Present,
      absentDays: attendanceStats.Absent,
      halfDays: attendanceStats["Half Day"],
      leaveDays: attendanceStats.Leave,
      remarks: `Generated based on attendance: ${attendanceStats.Present} present, ${attendanceStats.Absent} absent, ${attendanceStats["Half Day"]} half days, ${attendanceStats.Leave} leave days`,
    });

    await salary.save();
    console.log(`Salary generated for teacher ${teacherId} for ${month}`);
    res.json({
      success: true,
      message: "Salary generated successfully",
      salary,
    });
  } catch (err) {
    console.error("Error generating salary:", err);
    res
      .status(500)
      .json({ success: false, message: "Error generating salary" });
  }
});

// Update salary payment status
router.post("/teacher-salary/pay", async (req, res) => {
  const { salaryId, paymentStatus, paymentMethod, paymentDate, remarks } =
    req.body;
  try {
    const salary = await TeacherSalary.findById(salaryId);
    if (!salary) {
      return res
        .status(404)
        .json({ success: false, message: "Salary record not found" });
    }

    salary.paymentStatus = paymentStatus;
    salary.paymentMethod = paymentMethod;
    salary.paymentDate = paymentDate;
    salary.remarks = remarks;
    await salary.save();

    res.json({ success: true, message: "Payment status updated successfully" });
  } catch (err) {
    console.error("Error updating payment status:", err);
    res
      .status(500)
      .json({ success: false, message: "Error updating payment status" });
  }
});

// Delete salary record
router.delete("/teacher-salary/delete/:salaryId", async (req, res) => {
  const { salaryId } = req.params;
  try {
    const result = await TeacherSalary.findByIdAndDelete(salaryId);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Salary record not found" });
    }
    res.json({ success: true, message: "Salary record deleted successfully" });
  } catch (err) {
    console.error("Error deleting salary record:", err);
    res
      .status(500)
      .json({ success: false, message: "Error deleting salary record" });
  }
});

// Add manual salary record
router.post("/teacher-salary/add", async (req, res) => {
  const {
    teacherId,
    month,
    year,
    basicSalary,
    allowances,
    deductions,
    paymentMethod,
    paymentStatus,
    paymentDate,
    remarks,
  } = req.body;

  try {
    // Check if salary already exists for this month
    const existingSalary = await TeacherSalary.findOne({ teacherId, month });
    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message: "Salary already exists for this month",
      });
    }

    // Calculate net salary
    const netSalary =
      parseInt(basicSalary) +
      parseInt(allowances || 0) -
      parseInt(deductions || 0);

    // Create salary record
    const salary = new TeacherSalary({
      teacherId,
      month,
      year: parseInt(year),
      basicSalary: parseInt(basicSalary),
      allowances: parseInt(allowances || 0),
      deductions: parseInt(deductions || 0),
      netSalary,
      paymentMethod,
      paymentStatus,
      paymentDate,
      remarks,
    });

    await salary.save();
    console.log(`Manual salary added for teacher ${teacherId} for ${month}`);
    res.json({
      success: true,
      message: "Salary record added successfully",
      salary,
    });
  } catch (err) {
    console.error("Error adding salary record:", err);
    res
      .status(500)
      .json({ success: false, message: "Error adding salary record" });
  }
});

// Increase teacher salary
router.post("/teacher-salary/increase", async (req, res) => {
  const { teacherId, increaseType, increaseValue, effectiveDate, reason } =
    req.body;

  try {
    // Validate input
    if (
      !teacherId ||
      !increaseType ||
      !increaseValue ||
      !effectiveDate ||
      !reason
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Get current teacher
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    const currentSalary = parseInt(teacher.salary);
    if (isNaN(currentSalary) || currentSalary <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid current salary" });
    }

    let newSalary = currentSalary;

    // Calculate new salary based on increase type
    if (increaseType === "percentage") {
      const percentage = parseFloat(increaseValue);
      if (isNaN(percentage) || percentage < 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid percentage value" });
      }
      newSalary = currentSalary + (currentSalary * percentage) / 100;
    } else if (increaseType === "fixed") {
      const fixedAmount = parseFloat(increaseValue);
      if (isNaN(fixedAmount) || fixedAmount < 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid fixed amount" });
      }
      newSalary = currentSalary + fixedAmount;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid increase type" });
    }

    // Round the new salary
    const roundedNewSalary = Math.round(newSalary);

    // Update teacher salary
    teacher.salary = roundedNewSalary;
    await teacher.save();

    // Create salary history record with a unique identifier
    const currentDate = new Date();
    const monthStr = currentDate.toISOString().slice(0, 7);
    const uniqueMonth = `${monthStr}-increase-${Date.now()}`; // Make it unique

    const salaryHistory = new TeacherSalary({
      teacherId,
      month: uniqueMonth,
      year: currentDate.getFullYear(),
      basicSalary: currentSalary,
      allowances: 0,
      deductions: 0,
      netSalary: currentSalary,
      paymentMethod: "Bank Transfer",
      paymentStatus: "Pending",
      remarks: `Salary increased from ₹${currentSalary} to ₹${roundedNewSalary}. ${reason}. Effective from: ${effectiveDate}`,
    });

    await salaryHistory.save();

    console.log(
      `Salary increased for teacher ${teacherId} from ₹${currentSalary} to ₹${roundedNewSalary}`
    );
    res.json({
      success: true,
      message: "Salary increased successfully",
      oldSalary: currentSalary,
      newSalary: roundedNewSalary,
    });
  } catch (err) {
    console.error("Error increasing salary:", err);
    res.status(500).json({
      success: false,
      message: "Error increasing salary: " + err.message,
    });
  }
});

// Update teacher status
router.post("/update-status", async (req, res) => {
  const { teacherId, status, remarks } = req.body;

  try {
    // Validate input
    if (!teacherId || !status) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Teacher ID and status are required",
        });
    }

    // Get current teacher
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    // Validate status
    const validStatuses = [
      "Active",
      "Suspended",
      "On Leave",
      "Terminated",
      "Resigned",
      "Retired",
    ];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    // Update teacher status
    const oldStatus = teacher.status;
    teacher.status = status;
    await teacher.save();

    console.log(
      `Status updated for teacher ${teacherId} from ${oldStatus} to ${status}`
    );

    res.json({
      success: true,
      message: "Status updated successfully",
      status: status,
      oldStatus: oldStatus,
    });
  } catch (err) {
    console.error("Error updating teacher status:", err);
    res.status(500).json({
      success: false,
      message: "Error updating teacher status: " + err.message,
    });
  }
});

// Preview bulk salary generation
router.post("/bulk-salary/preview", async (req, res) => {
  const { month, year, statusFilters } = req.body;

  try {
    // Validate input
    if (!month || !year || !statusFilters || statusFilters.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Month, year, and status filters are required",
        });
    }

    const monthStr = `${year}-${month.padStart(2, "0")}`;

    // Find teachers with selected statuses
    const teachers = await Teacher.find({ status: { $in: statusFilters } });

    // Filter out teachers who already have salary for this month
    const teachersToProcess = [];
    for (const teacher of teachers) {
      const existingSalary = await TeacherSalary.findOne({
        teacherId: teacher.teacherId,
        month: monthStr,
      });

      if (!existingSalary) {
        teachersToProcess.push({
          teacherId: teacher.teacherId,
          name: teacher.name,
          status: teacher.status,
          salary: teacher.salary,
        });
      }
    }

    res.json({
      success: true,
      teachersToProcess: teachersToProcess,
      totalCount: teachersToProcess.length,
    });
  } catch (err) {
    console.error("Error previewing bulk salary:", err);
    res.status(500).json({
      success: false,
      message: "Error previewing bulk salary: " + err.message,
    });
  }
});

// Generate bulk salary
router.post("/bulk-salary/generate", async (req, res) => {
  const { month, year, statusFilters } = req.body;

  try {
    // Validate input
    if (!month || !year || !statusFilters || statusFilters.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Month, year, and status filters are required",
        });
    }

    const monthStr = `${year}-${month.padStart(2, "0")}`;
    let processedCount = 0;
    let errors = [];

    // Find teachers with selected statuses
    const teachers = await Teacher.find({ status: { $in: statusFilters } });

    // Generate salary for each teacher
    for (const teacher of teachers) {
      try {
        // Check if salary already exists for this month
        const existingSalary = await TeacherSalary.findOne({
          teacherId: teacher.teacherId,
          month: monthStr,
        });

        if (existingSalary) {
          continue; // Skip if salary already exists
        }

        // Get attendance for the month
        const attendance = await TeacherAttendance.find({
          teacherId: teacher.teacherId,
          date: { $regex: `^${monthStr}` },
        });

        // Calculate attendance statistics
        const attendanceStats = {
          Present: 0,
          Absent: 0,
          "Half Day": 0,
          Leave: 0,
        };

        attendance.forEach((record) => {
          if (attendanceStats.hasOwnProperty(record.status)) {
            attendanceStats[record.status]++;
          }
        });

        // Calculate salary (basic salary + allowances - deductions)
        const basicSalary = teacher.salary;
        const allowances = 0; // Can be customized
        const deductions = 0; // Can be customized based on attendance
        const netSalary = basicSalary + allowances - deductions;

        // Create salary record
        const salary = new TeacherSalary({
          teacherId: teacher.teacherId,
          month: monthStr,
          year: parseInt(year),
          basicSalary,
          allowances,
          deductions,
          netSalary,
          attendanceDays: attendanceStats.Present,
          absentDays: attendanceStats.Absent,
          halfDays: attendanceStats["Half Day"],
          leaveDays: attendanceStats.Leave,
          remarks: `Bulk generated - Attendance: ${attendanceStats.Present} present, ${attendanceStats.Absent} absent, ${attendanceStats["Half Day"]} half days, ${attendanceStats.Leave} leave days`,
        });

        await salary.save();
        processedCount++;

        console.log(
          `Bulk salary generated for teacher ${teacher.teacherId} for ${monthStr}`
        );
      } catch (error) {
        console.error(
          `Error generating salary for teacher ${teacher.teacherId}:`,
          error
        );
        errors.push(`Teacher ${teacher.teacherId}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Bulk salary generation completed`,
      processedCount: processedCount,
      totalTeachers: teachers.length,
      errors: errors,
    });
  } catch (err) {
    console.error("Error generating bulk salary:", err);
    res.status(500).json({
      success: false,
      message: "Error generating bulk salary: " + err.message,
    });
  }
});

// Store Credential
router.post("/credential", async (req, res) => {
  try {
    const [id, email, name] = req.body.id.split(",");
    const pass = generateCredentials(id);
    const hashedPassword = await bcrypt.hash(pass, saltRounds);

    const oldUser = await User.findOne({ id });

    if (!oldUser) {
      // Send credentials to teacher email
      try {
        await sendPasswordTeacher(id, email, pass, name);
        console.log("Email sent to:", email);
      } catch (err) {
        console.error("Email sending error:", err);
        return res.status(500).send("Failed to send email");
      }

      // Save teacher to database
      const user = new User({
        email,
        id,
        pass: hashedPassword,
        name,
        role: "teacher",
      });

      await user.save();
    } else {
      console.log("Teacher already exists:", oldUser);
    }

    res.redirect("/admin/teacher");
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
