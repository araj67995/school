const express = require("express");
const router = express.Router();  // ← invoke the Router function

const Admission = require("../../models/admission");
const {Student} = require("../../models/student");
const {formatDateToDDMMYYYY, generateStudentId, rollnoGenerater} = require('../../utils/helpers');

router.get("/", (req, res) => {
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
router.post("/reviewAdmission", async (req, res) => {
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
router.post("/reject", (req, res) => {
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
router.post("/directAdmission", async (req, res) => {
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

module.exports = router;
