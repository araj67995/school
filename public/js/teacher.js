// Correct variable name spelling: `studnets` -> `students`
const studentData = Students.map((foundItem) => ({
  id: foundItem.enrollmentNo,
  name: foundItem.name,
  fathersName: foundItem.parentName,
  rollNo: foundItem.rollno,
  section: foundItem.section,
  grade: foundItem.grade,
  status: foundItem.status,
}));

const attendances = Attendances.map((foundAtten) => ({
  attendanceID: foundAtten._id,
  month: foundAtten.month,
  present: foundAtten.present,
  absent: foundAtten.absent,
  percentage: foundAtten.percentage,
  remark: foundAtten.remark,
  aid: foundAtten.enrollmentNo,
}));

const marks = Marks.map((foundMarks) => ({
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

function loadStudents() {
  const [grade, section] = document
    .getElementById("classSelector")
    .value.split(" ")
    .map((s) => s.trim());
  const studentList = document.getElementById("studentList");

  if (!grade || !section) {
    studentList.innerHTML =
      '<div class="no-class-selected">Please select a class to view students</div>';
    return;
  }

  const students = studentData.filter(
    (s) => s.grade === grade && s.section === section
  );

  if (students.length === 0) {
    studentList.innerHTML = `<div class="no-students">No students found for Class ${grade} ${section}</div>`;
    return;
  }

  let html = '<div class="student-table-container">';
  html += '<table class="student-table">';
  html +=
    "<thead><tr><th>ID</th><th>Name</th><th>Roll No</th><th>Father's Name</th><th>Status</th><th>Actions</th></tr></thead>";
  html += "<tbody>";

  students.forEach((student) => {
    html += `
      <tr>
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.rollNo}</td>
        <td>${student.fathersName}</td>
        <td>
          <span class="attendance-status">${student.status}</span>
        </td>
        <td>
         <div class="controls py-3">
            <button class="btn btn-primary btn-sm" onclick="view('${student.id}')" ><i class="bi bi-eye"></i> View</button>
        </div>
        </td>
      </tr>
    `;
  });

  html += "</tbody></table></div>";
  studentList.innerHTML = html;
}

function view(id){
  const modalEl = document.getElementById("viewSection");
   const modal = new bootstrap.Modal(modalEl);
    const student = studentData.find((s) => s.id === id);
  if (student) {
   
    document.getElementById("grade-marksheet").value = student.grade;
    document.getElementById("section-marksheet").value = student.section;
    document.getElementById("id-marksheet").value = student.id;
    document.getElementById("name-marksheet").value = student.name;
    document.getElementById("father-marksheet").value = student.fathersName;
    document.getElementById("id-attendance").value = student.id;
    document.getElementById("rollNo-marksheet").value = student.rollNo;

    const studentAttendance = attendances.filter((a) => a.aid === id);
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

    const studentMarks = marks.filter((m) => m.id === id);
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

  modal.show();
}
};

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


function addAttendance() {
  const modalEl = document.getElementById("addAttendance");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function addMarks() {
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

function openLeaveModal() {
  const modal = new bootstrap.Modal(document.getElementById("leaveModal"));
  modal.show();
}
