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

const Counter = mongoose.model("Counter", counterSchema);

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
    studentID: String,
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
    previousSchool: String,
    parentName: String,
    mother: String,
    parentPhone: String,
    parentEmail: String,
    document: [String],
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
    grade: String,
    receiptNo: String,
    month: String,
    amount: Number,
    type: String,
    methods: [String],
    remark: String,
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

const subjectSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  theory: { type: Number, required: true },
  practical: { type: Number, required: true },
  total: { type: Number, required: true },
  grade: [{ type: String, required: true }],
}, { _id: true });

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
  name: String
});

const User = mongoose.model("Users", userSchema);

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

  const studentID = await generateStudentId();

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
    studentID: studentID,
  });

  AdmissionForm.save()
    .then(() => res.render("success"))
    .catch((err) => {
      console.error("Error saving data:", err);
      res.render("failure");
    });
});

// Admin Routes
app.get("/admin", (req, res) => {
  // find pending admission
  Admission.find()
    .sort({ createdAt: -1 })
    .then((found) => {
      res.render("admin/dashboard", {
        found: found,
      });
    })
    .catch((err) => {
      console.log(err);
    });
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
app.post("/reviewAdmission", (req, res) => {
  const {
    studentID,
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

  const student = new Student({
    enrollmentNo: studentID,
    name: studentName,
    dob: dob,
    gender: gender,
    email: email,
    phone: contact,
    address: address,
    grade: grade,
    previousSchool: previousSchool,
    parentName: fathersName,
    mother: mothersName,
    parentPhone: parentContact,
    parentEmail: parentEmail,
    document: [documents],
    status: "Active",
  });

  student
    .save()
    .then(() => {
      return Admission.findOneAndUpdate(
        { studentID: studentID },
        { status: "Approved" },
        { new: true } // optional: returns the updated document
      );
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
  const { ID } = req.body;

  return Admission.findOneAndUpdate(
    { studentID: ID },
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

  const student = new Student({
    enrollmentNo: studentID,
    name: studentName,
    dob: dob,
    gender: gender,
    email: email,
    phone: contact,
    address: address,
    grade: grade,
    previousSchool: previousSchool,
    parentName: fathersName,
    mother: mothersName,
    parentPhone: parentContact,
    parentEmail: parentEmail,
    document: [documents],
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

// Add Fee
app.post("/addFee", (req, res) => {
  const {
    receiptNo,
    id,
    name,
    grade,
    month,
    amount,
    feeType,
    methods,
    remark,
  } = req.body;

  const fee = new Fee({
    enrollmentNo: id,
    name,
    grade,
    receiptNo,
    month,
    amount,
    type: feeType,
    methods,
    remark,
  });

  fee.save();
});

// delete fee
app.post("/deleteFees", async (req, res) => {
  try {
    const { feeIds } = req.body;
    const idsToDelete = Array.isArray(feeIds) ? feeIds : [feeIds]; // handles 1 or many

    await Fee.deleteMany({ _id: { $in: idsToDelete } });

    // Redirect or respond as needed
    res.redirect(`/admin/student`); // or render the modal again
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
    grade
  } = req.body;

  try {
    // Prepare subjects array
    const newSubjects = subject.map((subj, i) => ({
      subject: subj,
      theory: parseFloat(theory[i]),
      practical: parseFloat(practical[i]),
      total: parseFloat(total[i]),
      grade: grade[i]
    }));

    // Find existing marksheet for this student, class, and term
    let existingMarksheet = await Marksheet.findOne({ enrollmentNo, term });

    if (existingMarksheet) {
      // Update or append each subject
      newSubjects.forEach(newSub => {
        const index = existingMarksheet.subjects.findIndex(
          sub => sub.subject === newSub.subject
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
        subjects: newSubjects
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
  const valuesArray = Array.isArray(combinedValues) ? combinedValues : [combinedValues];

  const deletionData = valuesArray.map(value => {
    const [marksId, subject] = value.split(",");
    return { marksId: marksId.trim(), subject: subject.trim() };
  });

  // You can now loop and delete:
  const operations = deletionData.map(d =>
    Marksheet.updateOne(
      { _id: d.marksId },
      { $pull: { subjects: { subject: d.subject } } }
    )
  );

  Promise.all(operations)
    .then(() => res.redirect("/admin/student"))
    .catch(err => {
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
        name
      });

      await user.save();
       res.redirect("/admin/student")
    } else {
      res.send(oldUser.pass, oldUser.email, oldUser.id, oldUser.name);
      res.redirect("/admin/student")
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
  const {name, father, mother, dob, gender, grade, section, previousWorking, contact,email, salary, experience, address, subject} = req.body;
  const teacherId = await genrateTeacherId();

  const teacher = new Teacher ({
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
    subject
  });

  teacher.save()
  .then(() => {
    res.redirect("/admin/teacher");
  })
  .catch((err) => {
    console.log(err);
  });
});

app.get("/admin/notice", (req, res) => {
  res.render("admin/notice");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server is started on port 3000 !!");
});
