const students = foundData.map((foundItem) => ({
  id: foundItem.enrollmentNo,
  name: foundItem.name,
  fathersName: foundItem.parentName,
  motherName: foundItem.mother,
  dob: foundItem.dob,
  gender: foundItem.gender,
  grade: foundItem.grade,
  contact: foundItem.phone,
  email: foundItem.email,
  parentNo: foundItem.parentPhone,
  parentEmail: foundItem.parentEmail,
  previousSchool: foundItem.previousSchool,
  address: foundItem.address,
  documents: foundItem.document,
  status: foundItem.status,
  date: foundItem.joiningDate,
  transport: foundItem.transport,
  rollno: foundItem.rollno,
  section: foundItem.section,
}));

const fees = feeData.map((foundFee) => ({
  feeid: foundFee._id,
  id: foundFee.enrollmentNo,
  receiptNo: foundFee.receiptNo,
  month: foundFee.month,
  amount: foundFee.total,
  type: foundFee.feeType,
  status: foundFee.status,
}));

const attendances = attendanceData.map((foundAtten) => ({
  attendanceID: foundAtten._id,
  month: foundAtten.month,
  present: foundAtten.present,
  absent: foundAtten.absent,
  percentage: foundAtten.percentage,
  remark: foundAtten.remark,
  aid: foundAtten.enrollmentNo,
}));

const marks = marksData.map((foundMarks) => ({
  id: foundMarks.enrollmentNo,
  marksId: foundMarks._id,
  term: foundMarks.term,
  subjects: foundMarks.subjects.map((subj) => ({
    subject: subj.subject,
    theory: subj.theory,
    practical: subj.practical,
    total: subj.total,
    grade: subj.grade,
  })),
}));

// Function to filter students by class
function filterStudents() {
  const selectedClass = document.getElementById("classFilter").value;
  const filteredStudents = selectedClass
    ? students.filter((student) => student.grade === selectedClass)
    : students;

  const tbody = document.getElementById("studentTableBody");
  tbody.innerHTML = filteredStudents
    .map(
      (student) => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.fathersName}</td>
            <td>${student.grade}</td>
            <td><span class="status-badge ${student.status.toLowerCase()}">${
        student.status
      }</span></td>
            <td>
                <button class="action-btn edit" type="button" onclick="viewStudentDetails('${
                  student.id
                }')">
                    <i class="bi bi-eye"></i> View
                </button>
                <form action="/admin/student/credential" method="post" style="display:inline;">
                    <button class="action-btn generate" type="submit" name="id" value="${
                      student.id
                    },${student.email},${student.name}">
                        <i class="bi bi-key"></i> Generate
                    </button>
                </form>
            </td>
        </tr>
    `
    )
    .join("");
}

function searchStudent() {
  const selectedId = document.getElementById("searchBar").value.trim();

  if (!selectedId) {
    alert("Please enter a Student ID.");
    return;
  }

  const filteredStudents = students.filter(
    (student) => student.id === selectedId
  );

  const tbody = document.getElementById("studentTableBody");
  tbody.innerHTML = filteredStudents
    .map(
      (student) => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.fathersName}</td>
            <td>${student.grade}</td>
            <td><span class="status-badge ${student.status.toLowerCase()}">${
        student.status
      }</span></td>
            <td>
                <button class="action-btn edit" type="button" onclick="viewStudentDetails('${
                  student.id
                }')">
                    <i class="bi bi-eye"></i> View
                </button>
                <form action="/admin/student/credential" method="post" style="display:inline;">
                    <button class="action-btn generate" type="submit" name="id" value="${
                      student.id
                    },${student.email},${student.name}">
                        <i class="bi bi-key"></i> Generate
                    </button>
                </form>
            </td>
        </tr>
    `
    )
    .join("");

  if (filteredStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">No student found with ID "${selectedId}".</td></tr>`;
  }
}

// Function to view student details
function viewStudentDetails(studentId) {
  const student = students.find((s) => s.id === studentId);
  if (student) {
    // Populate student details
    document.getElementById("studentEnrollment").textContent = student.id;
    document.getElementById("studentName").textContent = student.name;
    document.getElementById("studentFather").textContent = student.fathersName;
    document.getElementById("studentMother").textContent = student.motherName;
    document.getElementById("studentdob").textContent = student.dob;
    document.getElementById("studentEmail").textContent = student.email;
    document.getElementById("studentMobile").textContent = student.contact;
    document.getElementById("parentEmail").textContent = student.parentEmail;
    document.getElementById("parentMobile").textContent = student.parentNo;
    document.getElementById("studentAddress").textContent = student.address;
    document.getElementById("previousSchool").textContent =
      student.previousSchool;
    document.getElementById("document").textContent = student.documents;
    document.getElementById("grade").textContent = student.grade;
    document.getElementById("statusID").value = student.id;
    document.getElementById("grade-marksheet").value = student.grade;
    document.getElementById("section-marksheet").value = student.section;
    document.getElementById("id-marksheet").value = student.id;
    document.getElementById("name-marksheet").value = student.name;
    document.getElementById("father-marksheet").value = student.fathersName;
    document.getElementById("transportID").value = student.id;
    document.getElementById("rollno").textContent = student.rollno;
    document.getElementById("section").textContent = student.section;
    document.getElementById("rollNo-marksheet").value = student.rollno;
    document.getElementById("changeSectionEnrollmentNo").value = student.id;
    document.getElementById("changeSectionClass").value = student.grade;

    const studentFees = fees.filter((f) => f.id === studentId);
    const tbody = document.getElementById("feeTableBody");
    tbody.innerHTML = ""; // Clear existing rows

    studentFees.forEach((fee) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                    <td><input type="checkbox" name="feeIds" value="${fee.feeid}" /></td>
                    <td>${fee.receiptNo}</td>
                    <td>${fee.month}</td>
                    <td>${fee.amount}</td>
                    <td>${fee.type}</td>
                    <td>${fee.status}</td>
                  `;
      tbody.appendChild(row);
    });

    const studentAttendance = attendances.filter((a) => a.aid === studentId);
    const tbody2 = document.getElementById("attendenceTableBody");
    tbody2.innerHTML = "";

    studentAttendance.forEach((attendance) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                  <td><input type="checkbox" name="attendenceIds" value="${attendance.attendanceID}" /></td>
                  <td>${attendance.month}</td>
                  <td>${attendance.present}</td>
                  <td>${attendance.absent}</td>
                  <td>${attendance.percentage}</td>
                  <td>${attendance.remark}</td>
                  `;
      tbody2.appendChild(row);
    });

    const studentMarks = marks.filter((m) => m.id === studentId);
    const term1Body = document.getElementById("term1Body");
    const term2Body = document.getElementById("term2Body");
    term1Body.innerHTML = "";
    term2Body.innerHTML = "";

    studentMarks.forEach((mark) => {
      mark.subjects.forEach((subj) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                      <td><input type="checkbox" name="marksIds" value="${mark.marksId}, ${subj.subject}" /></td>
                      <td>${subj.subject}</td>
                      <td>${subj.theory}</td>
                      <td>${subj.practical}</td>
                      <td>${subj.total}</td>
                      <td>${subj.grade}</td>
                    `;
        if (mark.term === "term1") {
          term1Body.appendChild(row);
        } else if (mark.term === "term2") {
          term2Body.appendChild(row);
        }
      });
    });

    const yes = document.getElementById("yes");
    const no = document.getElementById("no");
    if (student.transport === "YES") {
      yes.classList.add("text-success");
      no.classList.remove("text-danger");
      no.style.opacity = 0.5;
    } else {
      yes.classList.remove("text-success");
      yes.style.opacity = 0.5;
      no.classList.add("text-danger");
    }

    // Set status badge
    const statusBadge = document.getElementById("studentStatus");
    statusBadge.textContent = student.status;
    statusBadge.className = "status-badge " + student.status.toLowerCase();

    const modal = new bootstrap.Modal(
      document.getElementById("studentDetailsModal")
    );
    modal.show();
  }
}

document
  .getElementById("selectAllFees")
  .addEventListener("change", function () {
    const checkboxes = document.querySelectorAll("input[name='feeIds']");
    checkboxes.forEach((cb) => (cb.checked = this.checked));
  });

document
  .getElementById("selectAllAtendance")
  .addEventListener("change", function () {
    const checkboxes = document.querySelectorAll("input[name='attendenceIds']");
    checkboxes.forEach((cb) => (cb.checked = this.checked));
  });

// Select All
document
  .getElementById("selectAllMarks1")
  .addEventListener("change", function () {
    document
      .querySelectorAll("#term1Body input[type='checkbox']")
      .forEach((cb) => (cb.checked = this.checked));
  });
document
  .getElementById("selectAllMarks2")
  .addEventListener("change", function () {
    document
      .querySelectorAll("#term2Body input[type='checkbox']")
      .forEach((cb) => (cb.checked = this.checked));
  });

function addFee() {
  const id = document.getElementById("studentEnrollment").textContent;
  const name = document.getElementById("studentName").textContent;
  const grade = document.getElementById("grade").textContent;
  const modalEl = document.getElementById("addFee"); // ID must be a string
  const modal = new bootstrap.Modal(modalEl);

  document.getElementById("id").value = id;
  document.getElementById("name").value = name;
  document.getElementById("gradeFee").value = grade;

  modal.show();
}

function addAttendance() {
  const id = document.getElementById("studentEnrollment").textContent;
  const modalEl = document.getElementById("addAttendance");
  const modal = new bootstrap.Modal(modalEl);

  document.getElementById("id-attendance").value = id;
  modal.show();
}

function addMarks() {
  const id = document.getElementById("studentEnrollment").textContent;
  const modalEl = document.getElementById("addMarksheet");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function addSubjectRow() {
  const table = document
    .getElementById("subjectsTable")
    .getElementsByTagName("tbody")[0];
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td>
      <select class="form-select subject-select" name="subject[]" required onchange="checkDuplicateSubject(this)">
        <option value="">Select Subject</option>
        <option>Math</option>
        <option>Science</option>
        <option>English</option>
        <option>Hindi</option>
        <option>S.St</option>
      </select>
    </td>
    <td><input type="number" class="form-control theory-input" name="theory[]" required oninput="autoFillTotalAndGrade(this)" /></td>
    <td><input type="number" class="form-control practical-input" name="practical[]" required oninput="autoFillTotalAndGrade(this)" /></td>
    <td><input type="number" class="form-control total-input" name="total[]" required readonly /></td>
    <td><input type="text" class="form-control grade-input" name="grade[]" required readonly /></td>
    <td><button type="button" class="btn btn-danger btn-sm" onclick="removeSubjectRow(this)"><i class="bi bi-x"></i></button></td>
  `;
  table.appendChild(newRow);
}

function removeSubjectRow(btn) {
  const row = btn.closest("tr");
  row.parentNode.removeChild(row);
}

function checkDuplicateSubject(selectElem) {
  const allSelects = document.querySelectorAll(
    "#subjectsTable .subject-select"
  );
  const selectedValue = selectElem.value;
  let duplicate = false;
  allSelects.forEach((sel) => {
    if (
      sel !== selectElem &&
      sel.value === selectedValue &&
      selectedValue !== ""
    ) {
      duplicate = true;
    }
  });
  if (duplicate) {
    alert("This subject is already added. Please select another subject.");
    selectElem.value = "";
  }
}

function autoFillTotalAndGrade(inputElem) {
  const row = inputElem.closest("tr");
  const theoryInput = row.querySelector(".theory-input");
  const practicalInput = row.querySelector(".practical-input");
  const totalInput = row.querySelector(".total-input");
  const gradeInput = row.querySelector(".grade-input");

  const theory = parseInt(theoryInput.value) || 0;
  const practical = parseInt(practicalInput.value) || 0;
  const total = theory + practical;
  totalInput.value = total;
  gradeInput.value = getGrade(total);
}

function getGrade(total) {
  if (total >= 90) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "B+";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 40) return "D";
  return "F";
}

// Attach autoFillTotalAndGrade to the initial row's inputs on page load
window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(
      "#subjectsTable .theory-input, #subjectsTable .practical-input"
    )
    .forEach((input) => {
      input.oninput = function () {
        autoFillTotalAndGrade(this);
      };
    });
});

function calculatePercentage() {
  const presentDay = parseFloat(document.getElementById("present").value);
  const absentDay = parseFloat(document.getElementById("absent").value);
  const percentage = document.getElementById("percentage");

  var totalDay = presentDay + absentDay;
  const percent = Math.round((presentDay / totalDay) * 100);

  percentage.value = percent + "%";
}

function validateFeeType(event) {
  const selected = document.querySelectorAll('input[name="feeType"]:checked');
  if (selected.length === 0) {
    alert("Please select at least one Fee Type.");
    event.preventDefault(); // Block form submission
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form"); // Change if you have a specific form ID/class
  form.addEventListener("submit", validateFeeType);
});

function openChangeSection() {
  // Bootstrap 5 way of showing modal
  let modal = new bootstrap.Modal(document.getElementById('sectionModal'));
  modal.show();
}


