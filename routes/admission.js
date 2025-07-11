const express = require("express");
const router = express.Router();  // ← invoke the Router function

const Admission = require("../models/admission");

// ADMISSION ROUTE
router.get("/", (req, res) => {
  res.render("admissionForm");
});

router.post("/", async (req, res) => {
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

module.exports = router;
