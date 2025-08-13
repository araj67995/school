const express = require("express");
const router = express.Router(); // ← invoke the Router function

const Admission = require("../models/admission");
const { sendAdmissionDetails } = require("../utils/mail.js");

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

  try {
    // Save form to DB first
    await AdmissionForm.save();

    // Send confirmation email (combine first & last name)
    const fullName = `${firstName} ${lastName || ""}`.trim();
    await sendAdmissionDetails(fullName, email);

    res.render("success");
  } catch (err) {
    console.error("Error saving data or sending email:", err);
    res.render("failure");
  }
});

module.exports = router;
