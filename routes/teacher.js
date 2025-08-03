const express = require("express");
const router = express.Router();
const { requireTeacher } = require("../utils/auth");
const {
  Teacher,
  TeacherAttendance,
  TeacherSalary,
  TeacherLeave,
} = require("../models/teacher");
const { Student, Attendance, Marksheet } = require("../models/student");

// Apply authentication middleware to all teacher routes
router.use(requireTeacher);

router.get("/:id", async (req, res) => {
  try {
    // Verify that the teacher is accessing their own page
    if (req.params.id !== req.user.id) {
      return res.redirect("/login");
    }

    const teacher = await Teacher.findOne({ teacherId: req.params.id });
    if (!teacher) {
      return res.status(404).render("error", {
        message: "Teacher not found, Please contact to School",
      });
    }

    // Fetch teacher's own attendance and salary records
   const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1; // JS month: 0-indexed

    const monthStr = String(month).padStart(2, '0'); // "07"
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`; // We'll handle exact days in rendering

    const attendan = await TeacherAttendance.find({
      teacherId: req.params.id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Create daily map
    const dailyStatus = {};
    attendan.forEach((record) => {
      dailyStatus[record.date] = {
        status: record.status,
        approved: record.approved,
        remark: record.remark || "",
      };
    });

    const teacherSalaries = await TeacherSalary.find({ teacherId: req.params.id }).sort({ year: -1, month: -1 });

    const present = await TeacherAttendance.find({
      teacherId: req.params.id,
      status: "Present",
    });
    const halfDay = await TeacherAttendance.find({
      teacherId: req.params.id,
      status: "Half Day",
    });
    const leave = await TeacherAttendance.find({
      teacherId: req.params.id,
      status: "Leave",
    });
    const absent = await TeacherAttendance.find({
      teacherId: req.params.id,
      status: "Absent",
    });
    const section = teacher.section.split(",").map((s) => s.trim());

    const students = await Student.find({
      grade: teacher.grade,
      section: { $in: section },
    });

    const marks = await Marksheet.find({ grade: teacher.grade });
    const attendances = await Attendance.find();

    const sections = [];

    for (i = 0; i < section.length; i++) {
      sections.push(`${section[i]}`);
    }

    res.render("teacher", {
      teacher: teacher,
      present: present,
      leave: leave,
       selectedMonth: parseInt(month),
      selectedYear: parseInt(year),
      attendanceDays: dailyStatus,
      absent: absent,
      halfDay: halfDay,
      sections: sections,
      students: students,
      marks: marks,
      attendances: attendances,
      teacherSalaries: teacherSalaries,
    });
  } catch (error) {
    console.error("Teacher page error:", error);
    res.status(500).render("error", { message: "Internal server error" });
  }
});

router.get("/api/:id/attendance", async (req, res) => {
  try {
    const teacherId = req.params.id;
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);

    const monthStr = String(month).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`;

    const records = await TeacherAttendance.find({
      teacherId,
      date: { $gte: startDate, $lte: endDate },
    });

    const daily = {};
    records.forEach((rec) => {
      daily[rec.date] = {
        status: rec.status,
        remark: rec.remark || '',
        approved: rec.approved,
      };
    });

    res.json({ success: true, daily, year, month });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error loading attendance" });
  }
});


// add attendence

router.post("/addAttendence", async (req, res) => {
  const { month, id, present, absent, percentage, remark } = req.body;

  try {
    const exist = await Attendance.findOne({ enrollmentNo: id, month });

    if (exist) {
      await Attendance.findOneAndUpdate(
        { enrollmentNo: id, month },
        {
          present,
          absent,
          percentage,
          remark,
        }
      );
    } else {
      const attendence = new Attendance({
        enrollmentNo: id,
        month,
        present,
        absent,
        percentage,
        remark,
      });

      await attendence.save(); // or after update

      res.redirect("back"); // This refreshes the same page
    }
  } catch (err) {
    console.error("Error in addAttendence:", err);
    res.status(500).send("Server Error");
  }
});

// delete attendence
router.post("/deleteAttendence", async (req, res) => {
  try {
    const { attendenceIds } = req.body;
    const idsToDelete = Array.isArray(attendenceIds)
      ? attendenceIds
      : [attendenceIds]; // handles 1 or many

    await Attendance.deleteMany({ _id: { $in: idsToDelete } });

    // Redirect or respond as needed
     res.redirect("back"); // or render the modal again
  } catch (error) {
    console.error("Error deleting fees:", error);
    res.status(500).send("Server error while deleting fees");
  }
});

/// POST route to add a new marksheet
router.post("/addMarksheet", async (req, res) => {
  const {
    id: enrollmentNo,
    name,
    studentGrade,
    father,
    term,
    subject,
    theory,
    practical,
    total,
    grade,
    section,
    rollno
  } = req.body;

  console.log(enrollmentNo, name, studentGrade, father);
  try {
    // Prepare subjects array
    const newSubjects = subject.map((subj, i) => ({
      subject: subj,
      theory: parseFloat(theory[i]),
      practical: parseFloat(practical[i]),
      total: parseFloat(total[i]),
      grade: grade[i],
    }));

    // Find existing marksheet for this student, class, and term
    let existingMarksheet = await Marksheet.findOne({ enrollmentNo, term });

    if (existingMarksheet) {
      // Update or append each subject
      newSubjects.forEach((newSub) => {
        const index = existingMarksheet.subjects.findIndex(
          (sub) => sub.subject === newSub.subject
        );

        if (index !== -1) {
          // Subject exists, update it
          existingMarksheet.subjects[index] = newSub;
        } else {
          // Subject does not exist, add it
          existingMarksheet.subjects.push(newSub);
        }
      });

      await existingMarksheet.save();
      console.log("Updated existing marksheet with new/updated subjects.");
       res.redirect("back");

    } else {
      // No marksheet for this student + term, create new
      const newMarksheet = new Marksheet({
        enrollmentNo,
        name,
        fathersName: father,
        grade: studentGrade,
        term,
        section,
        rollno,
        subjects: newSubjects,
      });

      await newMarksheet.save();
      // or after existingMarksheet.save()

      res.redirect("back"); // to refresh current page
    }
    // or wherever your dashboard is
  } catch (err) {
    console.error("Marksheet error:", err);
    res.status(500).send("Failed to add/update marksheet.");
  }
});

// delete marks
router.post("/deleteMarks", (req, res) => {
  const combinedValues = req.body.marksIds; // can be a string or array
  const valuesArray = Array.isArray(combinedValues)
    ? combinedValues
    : [combinedValues];

  const deletionData = valuesArray.map((value) => {
    const [marksId, subject] = value.split(",");
    return { marksId: marksId.trim(), subject: subject.trim() };
  });

  // You can now loop and delete:
  const operations = deletionData.map((d) =>
    Marksheet.updateOne(
      { _id: d.marksId },
      { $pull: { subjects: { subject: d.subject } } }
    )
  );
   Promise.all(operations)
    .then(() => res.redirect("back"))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error deleting subjects.");
    });
});

// Add POST route for leave application
router.post("/applyLeave", async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;
    const teacherId = req.user.id;
    if (!fromDate || !toDate || !reason) {
      return res.status(400).send("All fields are required");
    }
    const leave = new TeacherLeave({
      teacherId,
      fromDate,
      toDate,
      reason,
      status: "Pending",
    });
    await leave.save();
    res.redirect("back");
  } catch (err) {
    console.error("Error applying for leave:", err);
    res.status(500).send("Server error while applying for leave");
  }
});

module.exports = router;
