const express = require("express");
const router = express.Router(); 

const { Student, Fee, Attendance, Marksheet} = require("../../models/student");
const { generateRecipt, generateStudentId, rollnoGenerater, generateCredentials} = require('../../utils/helpers');

// Student Route.
router.get("/", (req, res) => {
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

router.post("/updateStatus", (req, res) => {
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
router.post("/addService", (req, res) => {
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
router.post("/addFee", async (req, res) => {
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
router.post("/deleteFees", async (req, res) => {
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

router.post("/addAttendence", (req, res) => {
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
router.post("/deleteAttendence", async (req, res) => {
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
    .then(() => res.redirect("/admin/student"))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error deleting subjects.");
    });
});

// Store Credential
router.post("/credential", async (req, res) => {
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

module.exports = router;