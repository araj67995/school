const express = require("express");
const router = express.Router();

const {Fee, Student} = require("../../models/student");
const { generateRecipt} = require('../../utils/helpers');

// Payment Method
router.get("/", async(req, res) => {

 const students = await Student.find();
 const fee = await Fee.find().sort({receiptNo: -1});

  res.render("admin/payments", {
    Students: students,
    Fees : fee,
  });
});

// add monthly dues in bulk
router.post("/addBulk", async (req, res) => {
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

router.post("/payment", async (req, res) => {
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

module.exports = router;