// Sample student data
// Transformed students array
const students = studentData.map((student) => ({
  id: student.enrollmentNo,
  name: student.name,
  fathersName: student.parentName,
  grade: student.grade + student.section,
  rollno: student.rollno,
}));

// Only fees with status "Dues"
const fees = feeData
  .filter((fee) => fee.status === "Dues")
  .map((fee) => ({
    feeid: fee._id,
    id: fee.enrollmentNo,
    receiptNo: fee.receiptNo,
    month: fee.month,
    year: fee.year,
    tuition: fee.tuition,
    transport: fee.transport,
    exam: fee.exam,
    other: fee.other,
    total: fee.total,
    methods: fee.methods,
    type: fee.feeType,
    status: fee.status,
  }));

function searchStudent() {
  const enrollmentNo = document.getElementById("enrollmentNumber").value;
  const student = students.find((s) => s.id === enrollmentNo);
  const fee = fees.find((f) => f.id === enrollmentNo);

  if (student) {
    // Display student information
    document.getElementById("studentName").textContent = student.name;
    document.getElementById("studentClass").textContent = student.grade;
    document.getElementById("studentRoll").textContent = student.rollno;
    document.getElementById("fatherName").textContent = student.fathersName;
    document.getElementById("paymentId").value = student.id;
    document.getElementById("father").value = student.fathersName;
    document.getElementById("name").value = student.name;

    // Display dues
    document.getElementById("tuitionDue").textContent = fee.tuition;
    document.getElementById("transportDue").textContent = fee.transport;
    document.getElementById("examDue").textContent = fee.exam;
    document.getElementById("otherDue").textContent = fee.other;

    // Show sections
    document.getElementById("studentInfo").style.display = "block";
    document.getElementById("paymentOptions").style.display = "block";

    // Calculate totals
    calculateTotals();
  } else {
    alert("Student not found! Please check the enrollment number.");
  }
}

function calculateTotals() {
  const tuitionDue = parseInt(
    document.getElementById("tuitionDue").textContent
  );
  const transportDue = parseInt(
    document.getElementById("transportDue").textContent
  );
  const examDue = parseInt(document.getElementById("examDue").textContent);
  const otherDue = parseInt(document.getElementById("otherDue").textContent);

  const tuitionPayment =
    parseInt(document.getElementById("tuitionPayment").value) || 0;
  const transportPayment =
    parseInt(document.getElementById("transportPayment").value) || 0;
  const examPayment =
    parseInt(document.getElementById("examPayment").value) || 0;
  const otherPayment =
    parseInt(document.getElementById("otherPayment").value) || 0;

  const totalDue = tuitionDue + transportDue + examDue + otherDue;
  const totalPayment =
    tuitionPayment + transportPayment + examPayment + otherPayment;
  const remaining = totalDue - totalPayment;

  document.getElementById("totalDue").textContent = totalDue;
  document.getElementById("totalPayment").textContent = totalPayment;
  document.getElementById("remainingAmount").textContent = remaining;
  document.getElementById("totalPay").value = totalPayment;
  document.getElementById("remainingPay").value = remaining;
}

// Add event listeners for payment inputs
document.addEventListener("DOMContentLoaded", function () {
  const paymentInputs = [
    "tuitionPayment",
    "transportPayment",
    "examPayment",
    "otherPayment",
  ];
  paymentInputs.forEach((id) => {
    document.getElementById(id).addEventListener("input", calculateTotals);
  });
});

function calculateTotalsFee() {
  const toInt = (val) => (isNaN(parseInt(val)) ? 0 : parseInt(val));

  const tuition = toInt(document.getElementById("tuitionFee").value);
  const transport = toInt(document.getElementById("transportFee").value);
  const exam = toInt(document.getElementById("examFee").value);
  const other = toInt(document.getElementById("otherFee").value);

  const total = tuition + transport + exam + other;
  document.getElementById("total").value = total;
}

function processPayment() {
  const totalPayment = parseInt(
    document.getElementById("totalPayment").textContent
  );
  if (totalPayment > 0) {
    alert("Payment processed successfully!");
    // Reset form
    document.getElementById("enrollmentNumber").value = "";
    document.getElementById("studentInfo").style.display = "none";
    document.getElementById("paymentOptions").style.display = "none";

    // Clear payment inputs
    [
      "tuitionPayment",
      "transportPayment",
      "examPayment",
      "otherPayment",
    ].forEach((id) => {
      document.getElementById(id).value = "";
    });
  } else {
    alert("Please enter payment amounts!");
  }
}

function showBulkDueModal() {
  const modal = new bootstrap.Modal(document.getElementById("bulkDueModal"));
  modal.show();
}

function generateBulkDues() {
  const form = document.getElementById("bulkDueForm");
  if (form.checkValidity()) {
    const formData = new FormData(form);
    const month = formData.get("month");
    const year = formData.get("year");
    const selectedClasses = formData.getAll("classes");

    alert(
      `Monthly dues generated for ${month} ${year} for classes: ${selectedClasses.join(
        ", "
      )}`
    );

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("bulkDueModal")
    );
    modal.hide();
    form.reset();
  } else {
    form.reportValidity();
  }
}

function validateForm(event) {
  const checkboxes = document.querySelectorAll('input[name="methods"]:checked');
  if (checkboxes.length === 0) {
    alert("Please select at least one payment method.");
    event.preventDefault(); // Stop form from submitting
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form"); // Adjust selector if needed
  form.addEventListener("submit", validateForm);
});
