const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb://localhost:27017/school", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// date
// Helper to format date as DD-MM-YYYY
function formatDateToDDMMYYYY(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

const counterSchema = new mongoose.Schema({
  year: Number,
  count: Number,
});

const reciptCounterSchema = new mongoose.Schema({
  year: Number,
  count: Number,
});

const rollCounterSchema = new mongoose.Schema({
  year: Number,
  count: Number,
  grade: String,
  section: {
    type: String,
    default: "A",
  },
});

const ReciptNo = mongoose.model("Recipt-Counter", reciptCounterSchema);
const Counter = mongoose.model("Counter", counterSchema);
const RollNo = mongoose.model("Roll-Numbers", rollCounterSchema);

async function generateRecipt(date) {
   const d = date.getDate().toString().padStart(2, "0");
   const m = (date.getMonth() + 1).toString().padStart(2, "0");
   const year = date.getFullYear();

   const counter =  await ReciptNo.findOneAndUpdate(
    { year },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
   );

  const number = String(counter.count).padStart(3, "0");
  return `${year}${m}${d}${number}`
}

async function generateStudentId() {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { year },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  const number = String(counter.count).padStart(4, "0");
  return `SR${year}${number}`;
}

async function rollnoGenerater(grade) {
  const year = new Date().getFullYear();

  console.log(year);

  // Find all sections for this grade and year, sorted by section
  const records = await RollNo.find({ year, grade }).sort({ section: 1 });

  let section = "A";
  let count = 0;

  if (records.length > 0) {
    const lastRecord = records[records.length - 1];
    section = lastRecord.section;
    count = lastRecord.count;

    if (count >= 30) {
      // If count >= 30, go to next section
      section = String.fromCharCode(section.charCodeAt(0) + 1);
      count = 0;
    }
  }

  // Now increment count
  const counter = await RollNo.findOneAndUpdate(
    { year, grade, section },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  const number = String(counter.count).padStart(2, "0");
  return `${section}, ${number}`; // returns like A01, B01 etc.
}

const teacherCounterSchema = new mongoose.Schema({
  year: Number,
  count: Number,
});

const TeacherCounter = mongoose.model("TeacherCounter", teacherCounterSchema);

async function genrateTeacherId() {
  const year = new Date().getFullYear();

  const counter = await TeacherCounter.findOneAndUpdate(
    { year },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  const number = String(counter.count).padStart(2, "0");
  return `SR${year}T${number}`;
}

// Function to generate credentials
function generateCredentials(id) {
  const username = id; // enrollment no
  const password = Math.random().toString(36).slice(-8); // random 8-char password

  return password;
}

const admissionSchema = new mongoose.Schema(
  {
    name: String,
    lastname: String,
    dob: Date,
    gender: String,
    email: String,
    phone: String,
    address: String,
    grade: String,
    previousSchool: String,
    parent: String,
    mother: String,
    parentNo: String,
    parentEmail: String,
    document: [String],
    status: String,
    createdAt: {
      type: String,
      default: function () {
        return formatDateToDDMMYYYY(new Date());
      },
    },
  },
  { timestamps: true }
);

const Admission = mongoose.model("Admissions", admissionSchema);

// Student Schema
const studentSchema = new mongoose.Schema(
  {
    enrollmentNo: String,
    name: String,
    dob: String,
    gender: String,
    email: String,
    phone: String,
    address: String,
    grade: String,
    rollno: Number,
    section: String,
    previousSchool: String,
    parentName: String,
    mother: String,
    parentPhone: String,
    parentEmail: String,
    document: [String],
    transport: String,
    status: {
      type: String,
      default: "Active",
    },
    joiningDate: {
      type: String,
      default: function () {
        return formatDateToDDMMYYYY(new Date());
      },
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

// Teacher Schema
const teacherSchema = new mongoose.Schema(
  {
    teacherId: String,
    name: String,
    dob: String,
    gender: String,
    email: String,
    contact: String,
    address: String,
    grade: String,
    section: String,
    previousWorking: String,
    father: String,
    mother: String,
    experience: Number,
    salary: Number,
    subject: String,
    status: {
      type: String,
      default: "Active",
    },
    joiningDate: {
      type: String,
      default: function () {
        return formatDateToDDMMYYYY(new Date());
      },
    },
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teachers", teacherSchema);

const feeSchema = new mongoose.Schema(
  {
    enrollmentNo: String,
    name: String,
    father: String,
    grade: String,
    receiptNo: String,
    month: String,
    year: String,
    tuition: Number,
    transport: Number,
    exam: Number,
    other: Number,
    total: Number,
     feeType: [String],     // ✅ ensure this is an array
   methods: [String],     // ✅ ensure this is an array
    status: String,
    createdAt: {
      type: String,
      default: function () {
        return formatDateToDDMMYYYY(new Date());
      },
    },
  },
  { timestamps: true }
);

const Fee = mongoose.model("Fee", feeSchema);

const attendenceSchema = new mongoose.Schema(
  {
    enrollmentNo: String,
    month: String,
    present: Number,
    absent: Number,
    percentage: String,
    remark: String,
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendenceSchema);

const subjectSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    theory: { type: Number, required: true },
    practical: { type: Number, required: true },
    total: { type: Number, required: true },
    grade: [{ type: String, required: true }],
  },
  { _id: true }
);

const marksSchema = new mongoose.Schema({
  enrollmentNo: { type: String, required: true },
  name: { type: String, required: true },
  fathersName: { type: String },
  grade: { type: String, required: true },
  rollno: { type: String },
  term: { type: String, required: true }, // "term1", "term2", etc.
  subjects: [subjectSchema],
  createdAt: { type: Date, default: Date.now },
});

const Marksheet = mongoose.model("Marksheet", marksSchema);

const userSchema = new mongoose.Schema({
  email: String,
  id: String,
  pass: String,
  name: String,
});

const User = mongoose.model("Users", userSchema);

// Teacher daily attendance schema
const teacherAttendanceSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    status: {
      type: String,
      enum: ["Present", "Absent", "Half Day", "Leave"],
      required: true,
    },
    remark: String,
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TeacherAttendance = mongoose.model(
  "TeacherAttendance",
  teacherAttendanceSchema
);

// Teacher leave schema
const teacherLeaveSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    fromDate: { type: String, required: true }, // YYYY-MM-DD
    toDate: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    remark: String,
  },
  { timestamps: true }
);

const TeacherLeave = mongoose.model("TeacherLeave", teacherLeaveSchema);

// Teacher salary schema
const teacherSalarySchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    month: { type: String, required: true }, // YYYY-MM
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Check"],
      default: "Bank Transfer",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending",
    },
    paymentDate: String,
    remarks: String,
    attendanceDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    createdAt: {
      type: String,
      default: function () {
        return formatDateToDDMMYYYY(new Date());
      },
    },
  },
  { timestamps: true }
);

const TeacherSalary = mongoose.model("TeacherSalary", teacherSalarySchema);

const noticeSchema = new mongoose.Schema(
  {
    title: String,
    date: String,
    status: String,
    remark: String,
  },
  { timestamps: true }
);

const Notice = mongoose.model("Notices", noticeSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/forget", (req, res) => {
  res.render("forget");
});

// ADMISSION ROUTE
app.get("/admission", (req, res) => {
  res.render("admissionForm");
});

app.post("/admission", async (req, res) => {
  const {
    firstName,
    lastName,
    dob,
    gender,
    email,
    phone,
    address,
    grade,
    previousSchool,
    parentName,
    parentPhone,
    motherName,
    parentEmail,
    documents,
  } = req.body;

  if (!firstName || !email || !grade || !phone) {
    return res.render("failure");
  }

  const AdmissionForm = new Admission({
    name: firstName,
    lastname: lastName,
    dob,
    gender,
    email,
    phone,
    address,
    grade,
    previousSchool,
    parent: parentName,
    parentNo: parentPhone,
    mother: motherName,
    parentEmail,
    document: documents,
    status: "Pending",
  });

  AdmissionForm.save()
    .then(() => res.render("success"))
    .catch((err) => {
      console.error("Error saving data:", err);
      res.render("failure");
    });
});

// Admin Routes
app.get("/admin", async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    const notices = await Notice.find().sort({ createdAt: -1 });
    const students = await Student.find();
    const teachers = await Teacher.find();
    const activeNotice = await Notice.find({status: "Active"});
    const pendingAdmissions = await Admission.find({status: "Pending"})
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


app.get("/admin/admission", (req, res) => {
  // find pending admission
  Admission.find()
    .sort({ createdAt: -1 })
    .then((found) => {
      res.render("admin/admission", {
        found: found,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// approve the pending admissions
app.post("/reviewAdmission", async (req, res) => {
  const {
    _id,
    studentName,
    fathersName,
    mothersName,
    dob,
    parentEmail,
    parentContact,
    previousSchool,
    gender,
    grade,
    contact,
    address,
    documents,
    email,
  } = req.body;

  const studentID = await generateStudentId();
  const x = await rollnoGenerater(grade);
  const [section, rollno] = x.split(",");

  const student = new Student({
    enrollmentNo: studentID,
    name: studentName,
    dob: dob,
    gender: gender,
    email: email,
    phone: contact,
    address: address,
    grade: grade,
    section,
    rollno,
    previousSchool: previousSchool,
    parentName: fathersName,
    mother: mothersName,
    parentPhone: parentContact,
    parentEmail: parentEmail,
    document: documents,
    status: "Active",
  });

  student
    .save()
    .then(() => {
      return Admission.findOneAndDelete({ _id});
    })
    .then(() => {
      res.redirect("/admin/admission");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
});

// Reject the pending admission
app.post("/reject", (req, res) => {
  const { _id } = req.body;

  console.log(_id)

  return Admission.findOneAndUpdate(
    { _id },
    { status: "Rejected" },
    { new: true } // optional: returns the updated document
  ).then(() => {
    res.redirect("/admin/admission");
  });
});

// Direct Admission
app.post("/directAdmission", async (req, res) => {
  const {
    studentName,
    fathersName,
    mothersName,
    dob,
    parentEmail,
    parentContact,
    previousSchool,
    gender,
    grade,
    contact,
    address,
    documents,
    email,
  } = req.body;

  const studentID = await generateStudentId();
  const x = await rollnoGenerater(grade);
  const [section, rollno] = x.split(",");

  const student = new Student({
    enrollmentNo: studentID,
    name: studentName,
    dob: dob,
    gender: gender,
    email: email,
    phone: contact,
    address: address,
    grade: grade,
    section,
    rollno,
    previousSchool: previousSchool,
    parentName: fathersName,
    mother: mothersName,
    parentPhone: parentContact,
    parentEmail: parentEmail,
    document: documents,
    status: "Active",
  });

  student
    .save()
    .then(() => {
      res.redirect("/admin/admission");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
});

// Student Route
app.get("/admin/student", (req, res) => {
  Student.find()
    .sort({ createdAt: -1 })
    .then((found) => {
      Fee.find()
        .sort({ createdAt: -1 })
        .then((fee) => {
          Attendance.find()
            .sort({ createdAt: -1 })
            .then((attendance) => {
              Marksheet.find().then((marks) => {
                res.render("admin/student", {
                  found: found,
                  fee: fee,
                  attendance: attendance,
                  marks: marks,
                });
              });
            });
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Update status of student

app.post("/updateStatus", (req, res) => {
  const { btn, statusID } = req.body;

  Student.updateOne({ enrollmentNo: statusID }, { status: btn })
    .then(() => {
      res.redirect("/admin/student");
    })
    .catch((err) => {
      console.log(err);
    });
});

// Add Transport
app.post("/addService", (req, res) => {
  const { id, btn } = req.body;

  if (btn === "YES") {
    Student.updateOne({ enrollmentNo: id }, { transport: "YES" })
      .then(() => {
        res.redirect("/admin/student");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    Student.updateOne({ enrollmentNo: id }, { transport: "NO" })
      .then(() => {
        res.redirect("/admin/student");
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

// Add Fee
app.post("/addFee", async (req, res) => {
  try {
    const {
      id,
      grade,
      name,
      month,
      amount,
      feeType,
      methods,
      status,
    } = req.body;

    // ✅ Parse amount safely
    const totalAmount = parseInt(amount);
    if (isNaN(totalAmount)) {
      return res.status(400).send("❌ Invalid amount provided.");
    }

    // ✅ Ensure feeType and methods are arrays
    const feeTypes = Array.isArray(feeType) ? feeType : (feeType ? [feeType] : []);
    const paymentMethods = Array.isArray(methods) ? methods : (methods ? [methods] : []);

    if (status === "Paid") {
      const date = new Date();
      const receiptNo = await generateRecipt(date);

      const paidFee = new Fee({
        enrollmentNo: id,
        grade,
        name,
        receiptNo,
        month,
        total: totalAmount,
        feeType: feeTypes,
        methods: paymentMethods,
        status,
      });

      await paidFee.save();

    } else if (status === "Dues") {
      const existingDues = await Fee.findOne({ enrollmentNo: id, status: "Dues" });

      if (existingDues) {
        existingDues.month += `, ${month}`;
        existingDues.other = (existingDues.other || 0) + totalAmount;
        existingDues.total = (existingDues.total || 0) + totalAmount;

        existingDues.feeType = [...new Set([...existingDues.feeType, ...feeTypes])];
        existingDues.methods = [...new Set([...existingDues.methods, ...paymentMethods])];

        await existingDues.save();
      } else {
        const duesFee = new Fee({
          enrollmentNo: id,
          grade,
          month,
          other: totalAmount,
          total: totalAmount,
          feeType: feeTypes,
          methods: paymentMethods,
          status,
        });

        await duesFee.save();
      }
    }

    res.redirect("/admin/student");

  } catch (err) {
    console.error("Error adding fee:", err);
    res.status(500).send("Server error while adding fee");
  }
});

// Delete Fee
app.post("/deleteFees", async (req, res) => {
  try {
    const { feeIds } = req.body;
    const idsToDelete = Array.isArray(feeIds) ? feeIds : [feeIds];

    // Step 1: Get the fee records being deleted
    const feesToDelete = await Fee.find({ _id: { $in: idsToDelete } });

    // Step 2: Group deleted fees by enrollmentNo and sum the amounts
    const grouped = {};

    for (let fee of feesToDelete) {
      const id = fee.enrollmentNo;
      if (!grouped[id]) {
        grouped[id] = { tuition: 0, transport: 0, exam: 0, other: 0, total: 0 };
      }

      grouped[id].tuition += fee.tuition || 0;
      grouped[id].transport += fee.transport || 0;
      grouped[id].exam += fee.exam || 0;
      grouped[id].other += fee.other || 0;
      grouped[id].total += fee.total || 0;
    }

    // Step 3: Update each "Dues" record for the student
    for (let enrollmentNo in grouped) {
      const existingDues = await Fee.findOne({ enrollmentNo, status: "Dues" });

      if (existingDues) {
        await Fee.findOneAndUpdate(
          { enrollmentNo, status: "Dues" },
          {
            $inc: {
              tuition: grouped[enrollmentNo].tuition,
              transport: grouped[enrollmentNo].transport,
              exam: grouped[enrollmentNo].exam,
              other: grouped[enrollmentNo].other,
              total: grouped[enrollmentNo].total
            }
          }
        );
      } else {
        // Optional: if no Dues exists, create one
        await Fee.create({
          enrollmentNo,
          status: "Dues",
          tuition: grouped[enrollmentNo].tuition,
          transport: grouped[enrollmentNo].transport,
          exam: grouped[enrollmentNo].exam,
          other: grouped[enrollmentNo].other,
          total: grouped[enrollmentNo].total
        });
      }
    }

    // Step 4: Delete the fees
    await Fee.deleteMany({ _id: { $in: idsToDelete } });

    res.redirect(`/admin/student`);
  } catch (error) {
    console.error("Error deleting fees:", error);
    res.status(500).send("Server error while deleting fees");
  }
});


// add attendence

app.post("/addAttendence", (req, res) => {
  const { month, id, present, absent, percentage, remark } = req.body;

  const attendence = new Attendance({
    enrollmentNo: id,
    month,
    present,
    absent,
    percentage,
    remark,
  });

  attendence
    .save()
    .then(() => {
      res.redirect("/admin/student");
    })
    .catch((err) => {
      console.log(err);
    });
});

// delete attendence
app.post("/deleteAttendence", async (req, res) => {
  try {
    const { attendenceIds } = req.body;
    const idsToDelete = Array.isArray(attendenceIds)
      ? attendenceIds
      : [attendenceIds]; // handles 1 or many

    await Attendance.deleteMany({ _id: { $in: idsToDelete } });

    // Redirect or respond as needed
    res.redirect(`/admin/student`); // or render the modal again
  } catch (error) {
    console.error("Error deleting fees:", error);
    res.status(500).send("Server error while deleting fees");
  }
});

/// POST route to add a new marksheet
app.post("/addMarksheet", async (req, res) => {
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
  } = req.body;

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
    } else {
      // No marksheet for this student + term, create new
      const newMarksheet = new Marksheet({
        enrollmentNo,
        name,
        fathersName: father,
        grade: studentGrade,
        term,
        subjects: newSubjects,
      });

      await newMarksheet.save();
      console.log("Created new marksheet.");
    }

    res.redirect("/admin/student"); // or wherever your dashboard is
  } catch (err) {
    console.error("Marksheet error:", err);
    res.status(500).send("Failed to add/update marksheet.");
  }
});

// delete marks
app.post("/deleteMarks", (req, res) => {
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
    .then(() => res.redirect("/admin/student"))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error deleting subjects.");
    });
});

// Store Credential
app.post("/credential", async (req, res) => {
  try {
    const [id, email, name] = req.body.id.split(",");
    const pass = generateCredentials(id);

    const oldUser = await User.findOne({ id });

    if (!oldUser) {
      const user = new User({
        email,
        id,
        pass,
        name,
      });

      await user.save();
      res.redirect("/admin/student");
    } else {
      console.log(oldUser.pass, oldUser.email, oldUser.id, oldUser.name);
      res.redirect("/admin/student");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.get("/admin/teacher", (req, res) => {
  Teacher.find()
    .then((found) => {
      res.render("admin/teacher", {
        teacher: found,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Add teacher
app.post("/addTeacher", async (req, res) => {
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
app.post("/teacher/apply-leave", async (req, res) => {
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
app.get("/admin/teacher-attendance/:teacherId", async (req, res) => {
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
app.post("/admin/teacher-attendance/mark", async (req, res) => {
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
app.delete("/admin/teacher-attendance/delete", async (req, res) => {
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
app.post("/admin/teacher-leave/approve", async (req, res) => {
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
    res.json({ success: true, message: `Leave ${status.toLowerCase()}` });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error updating leave status" });
  }
});

// Get teacher salary history
app.get("/admin/teacher-salary/:teacherId", async (req, res) => {
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

// Generate salary for a teacher for a specific month
app.post("/admin/teacher-salary/generate", async (req, res) => {
  const { teacherId, month, year } = req.body; // month: YYYY-MM
  try {
    // Check if salary already exists for this month
    const existingSalary = await TeacherSalary.findOne({ teacherId, month });
    if (existingSalary) {
      return res
        .status(400)
        .json({
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
app.post("/admin/teacher-salary/pay", async (req, res) => {
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
app.delete("/admin/teacher-salary/delete/:salaryId", async (req, res) => {
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
app.post("/admin/teacher-salary/add", async (req, res) => {
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
      return res
        .status(400)
        .json({
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
app.post("/admin/teacher-salary/increase", async (req, res) => {
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
    res
      .status(500)
      .json({
        success: false,
        message: "Error increasing salary: " + err.message,
      });
  }
});

// Notice Section
app.get("/admin/notice", (req, res) => {
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
app.post("/addNotice", (req, res) => {
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
app.post("/editNotice", (req, res) => {
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

// Payment Method
app.get("/admin/payments", async(req, res) => {

 const students = await Student.find();
 const fee = await Fee.find().sort({receiptNo: -1});

  res.render("admin/payments", {
    Students: students,
    Fees : fee,
  });
});

// add monthly dues in bulk
app.post("/addBulk", async (req, res) => {
  const { month, year, tuitionFee, transportFee, examFee, otherFee, classes, total } = req.body;
  const toInt = (val) => isNaN(parseInt(val)) ? 0 : parseInt(val);

  try {
    const students = await Student.find({ grade: { $in: classes } });

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const enrollmentNo = student.enrollmentNo;

      // Conditionally apply transport fee
      const tFee = student.transport === "YES" ? toInt(transportFee) : 0;

      // Calculate actual total for this student
      const calculatedTotal = toInt(tuitionFee) + tFee + toInt(examFee) + toInt(otherFee);

      const existingFee = await Fee.findOne({ enrollmentNo, status: "Dues", feeType:"Monthly" });

      if (!existingFee) {
        const fee = new Fee({
          enrollmentNo,
          grade: student.grade,
          month,
          year,
          tuition: toInt(tuitionFee),
          transport: tFee,
          exam: toInt(examFee),
          other: toInt(otherFee),
          total: calculatedTotal,
          methods: "",
          status: "Dues",
          feeType: "Monthly"
        });

        await fee.save();
      } else {
        const updatedFee = {
          month: `${existingFee.month} ${month}`,
          year: year,
          tuition: toInt(existingFee.tuition) + toInt(tuitionFee),
          transport: toInt(existingFee.transport) + tFee,
          exam: toInt(existingFee.exam) + toInt(examFee),
          other: toInt(existingFee.other) + toInt(otherFee),
          total: toInt(existingFee.total) + calculatedTotal,
          grade: existingFee.grade,
          methods: existingFee.methods,
          status: existingFee.status,
          enrollmentNo: existingFee.enrollmentNo,
          feeType: "Monthly"
        };

        await Fee.findOneAndReplace({ enrollmentNo, status: "Dues", feeType:"Monthly"  }, updatedFee);
      }
    }

    res.status(200).send("Bulk fees added/updated successfully.");
  } catch (err) {
    console.error("Error in /addBulk:", err);
    res.status(500).send("Server Error");
  }
});

// Payment From Payments Page

app.post("/payment", async (req, res) => {
   const {tuition, transport, exam, other, remaining, total, id, methods, name, father} = req.body;

   const fee = await Fee.findOne({ enrollmentNo: id, status: "Dues", feeType:"Monthly"  });

   var remainingTuition = fee.tuition - tuition;
   var remainingTransport = fee.transport - transport;
   var remainingExam = fee.exam - exam;
   var remainingOther = fee.other - other;
   const date = new Date();
   const receiptNo = await generateRecipt(date);

  await Fee.findOneAndUpdate(
  { enrollmentNo: id, status: "Dues" },
  {
    $set: {
      tuition: remainingTuition,
      exam: remainingExam,
      transport: remainingTransport,
      other: remainingOther,
      total: remaining,
      month: "",
    }
  },
  { new: true }
 )
 .then(() => {
  const paid = new Fee ({
    enrollmentNo: id,
    grade: fee.grade,
    month: fee.month,
    receiptNo,
    tuition,
    transport,
    exam,
    other,
    total,
    status: "Paid",
    methods,
    name,
    father,
    feeType: "Monthly"
  });

  if(total <= 0){
    res.send("Please Pay the Dues Amount")
  }else{
     paid.save().
  then(() => {
    // add generated receipt of payment here
    res.redirect("/admin/payments");
  });
  }; 
 })
 .catch((err) => {
  console.log(err);
 });

});

app.listen(process.env.PORT || 3000, () => {
  console.log("server is started on port 3000 !!");
});
