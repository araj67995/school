// Sample student data (replace with actual data from backend)
const studentData = {
  "10A": [
    { name: "Rahul Sharma", rollNo: "1001", fatherName: "Rajesh Sharma" },
    { name: "Priya Patel", rollNo: "1002", fatherName: "Sunil Patel" },
    { name: "Amit Kumar", rollNo: "1003", fatherName: "Rakesh Kumar" },
  ],
  "10B": [
    { name: "Neha Singh", rollNo: "1004", fatherName: "Vikram Singh" },
    { name: "Karan Malhotra", rollNo: "1005", fatherName: "Raj Malhotra" },
    { name: "Ananya Gupta", rollNo: "1006", fatherName: "Suresh Gupta" },
  ],
  "9A": [
    { name: "Vikram Yadav", rollNo: "2001", fatherName: "Ramesh Yadav" },
    { name: "Pooja Verma", rollNo: "2002", fatherName: "Suresh Verma" },
    { name: "Rohan Mehta", rollNo: "2003", fatherName: "Amit Mehta" },
  ],
  "9B": [
    { name: "Sneha Kapoor", rollNo: "2004", fatherName: "Rajesh Kapoor" },
    { name: "Arjun Reddy", rollNo: "2005", fatherName: "Krishna Reddy" },
    { name: "Zara Khan", rollNo: "2006", fatherName: "Imran Khan" },
  ],
  "8A": [
    { name: "Aditya Joshi", rollNo: "3001", fatherName: "Prakash Joshi" },
    { name: "Meera Shah", rollNo: "3002", fatherName: "Rahul Shah" },
    { name: "Rishi Agarwal", rollNo: "3003", fatherName: "Vijay Agarwal" },
  ],
  "8B": [
    { name: "Ishaan Nair", rollNo: "3004", fatherName: "Rajiv Nair" },
    { name: "Tanvi Desai", rollNo: "3005", fatherName: "Nilesh Desai" },
    { name: "Vihaan Kapoor", rollNo: "3006", fatherName: "Rahul Kapoor" },
  ],
};

// Set today's date as default
document.getElementById("attendanceDate").valueAsDate = new Date();

function loadStudents() {
  const classId = document.getElementById("classSelector").value;
  const studentList = document.getElementById("studentList");

  if (!classId) {
    studentList.innerHTML =
      '<div class="no-class-selected">Please select a class to view students</div>';
    return;
  }

  const students = studentData[classId];
  let html = '<div class="student-table-container">';
  html += '<table class="student-table">';
  html +=
    '<thead><tr><th><input type="checkbox" id="selectAll" onchange="toggleAllStudents()"></th><th>Name</th><th>Roll No</th><th>Father\'s Name</th><th>Status</th><th>Actions</th></tr></thead>';
  html += "<tbody>";

  students.forEach((student) => {
    html += `
                    <tr>
                        <td>
                            <input type="checkbox" class="student-checkbox" data-rollno="${student.rollNo}">
                        </td>
                        <td>${student.name}</td>
                        <td>${student.rollNo}</td>
                        <td>${student.fatherName}</td>
                        <td>
                            <span class="attendance-status" id="status-${student.rollNo}">Not Marked</span>
                        </td>
                        <td>
                            <div class="student-actions">
                                <button class="action-btn secondary-btn" onclick="manageMarks('${classId}', '${student.rollNo}')">
                                    <i class="fas fa-edit"></i>
                                    Marks
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
  });

  html += "</tbody></table></div>";
  studentList.innerHTML = html;
}

function toggleAllStudents() {
  const selectAll = document.getElementById("selectAll");
  const checkboxes = document.getElementsByClassName("student-checkbox");
  Array.from(checkboxes).forEach((checkbox) => {
    checkbox.checked = selectAll.checked;
  });
}

function markAllPresent() {
  const checkboxes = document.getElementsByClassName("student-checkbox");
  Array.from(checkboxes).forEach((checkbox) => {
    if (checkbox.checked) {
      const rollNo = checkbox.dataset.rollno;
      document.getElementById(`status-${rollNo}`).textContent = "Present";
      document.getElementById(`status-${rollNo}`).className =
        "attendance-status present";
    }
  });
}

function markAllAbsent() {
  const checkboxes = document.getElementsByClassName("student-checkbox");
  Array.from(checkboxes).forEach((checkbox) => {
    if (checkbox.checked) {
      const rollNo = checkbox.dataset.rollno;
      document.getElementById(`status-${rollNo}`).textContent = "Absent";
      document.getElementById(`status-${rollNo}`).className =
        "attendance-status absent";
    }
  });
}

function saveAttendance() {
  const classId = document.getElementById("classSelector").value;
  const date = document.getElementById("attendanceDate").value;
  const attendanceData = [];

  const checkboxes = document.getElementsByClassName("student-checkbox");
  Array.from(checkboxes).forEach((checkbox) => {
    const rollNo = checkbox.dataset.rollno;
    const status = document.getElementById(`status-${rollNo}`).textContent;
    if (status !== "Not Marked") {
      attendanceData.push({
        rollNo: rollNo,
        status: status,
        date: date,
      });
    }
  });

  // Here you would typically send this data to your backend
  console.log("Saving attendance:", {
    classId: classId,
    date: date,
    attendance: attendanceData,
  });

  alert("Attendance saved successfully!");
}

function updateAttendanceDate() {
  const date = document.getElementById("attendanceDate").value;
  // Here you would typically load existing attendance data for the selected date
  console.log("Loading attendance for date:", date);
}

// Sample subjects data
const subjects = [
  { name: "Mathematics", hasPractical: true, practicalMax: 20 },
  { name: "Science", hasPractical: true, practicalMax: 30 },
  { name: "English", hasPractical: true, practicalMax: 20 },
  { name: "Hindi", hasPractical: true, practicalMax: 20 },
  { name: "Social Studies", hasPractical: true, practicalMax: 20 },
];

// Sample marks data (replace with actual data from backend)
const marksData = {
  "10A": {
    1001: {
      first: {
        Mathematics: { written: 85, practical: 18, total: 103, grade: "A+" },
        Science: { written: 78, practical: 25, total: 103, grade: "A+" },
        English: { written: 82, practical: 18, total: 100, grade: "A+" },
        Hindi: { written: 75, practical: 17, total: 92, grade: "A" },
        "Social Studies": {
          written: 80,
          practical: 18,
          total: 98,
          grade: "A+",
        },
      },
      mid: {
        Mathematics: { written: 88, practical: 19, total: 107, grade: "A+" },
        Science: { written: 80, practical: 27, total: 107, grade: "A+" },
        English: { written: 85, practical: 19, total: 104, grade: "A+" },
        Hindi: { written: 78, practical: 18, total: 96, grade: "A+" },
        "Social Studies": {
          written: 82,
          practical: 19,
          total: 101,
          grade: "A+",
        },
      },
      final: {
        Mathematics: { written: 90, practical: 20, total: 110, grade: "A+" },
        Science: { written: 85, practical: 28, total: 113, grade: "A+" },
        English: { written: 88, practical: 20, total: 108, grade: "A+" },
        Hindi: { written: 80, practical: 19, total: 99, grade: "A+" },
        "Social Studies": {
          written: 85,
          practical: 20,
          total: 105,
          grade: "A+",
        },
      },
    },
    // Add more students' data here
  },
};

let currentStudent = null;
let currentClass = null;

function manageMarks(classId, rollNo) {
  currentStudent = rollNo;
  currentClass = classId;
  const modal = new bootstrap.Modal(document.getElementById("marksModal"));
  updateMarksTable();
  modal.show();
}

function updateMarksTable() {
  const term = document.getElementById("termSelect").value;
  const tableBody = document.getElementById("marksTableBody");
  let html = "";

  subjects.forEach((subject) => {
    const marks = marksData[currentClass]?.[currentStudent]?.[term]?.[
      subject.name
    ] || { written: "", practical: "", total: "", grade: "" };

    html += `
                    <tr>
                        <td>${subject.name}</td>
                        <td>
                            <input type="number" class="form-control marks-input" 
                                   data-subject="${subject.name}" 
                                   data-type="written" 
                                   max="100"
                                   value="${marks.written}"
                                   onchange="calculateTotal(this)">
                            <small class="text-muted">Max: 100</small>
                        </td>
                        <td>
                            <input type="number" class="form-control marks-input" 
                                   data-subject="${subject.name}" 
                                   data-type="practical" 
                                   max="${subject.practicalMax}"
                                   value="${marks.practical}"
                                   onchange="calculateTotal(this)">
                            <small class="text-muted">Max: ${subject.practicalMax}</small>
                        </td>
                        <td>
                            <span class="total-marks" data-subject="${subject.name}">${marks.total}</span>
                        </td>
                        <td>
                            <span class="grade" data-subject="${subject.name}">${marks.grade}</span>
                        </td>
                    </tr>
                `;
  });

  tableBody.innerHTML = html;
}

function calculateTotal(input) {
  const subject = input.dataset.subject;
  const type = input.dataset.type;
  const row = input.closest("tr");
  const writtenInput = row.querySelector('[data-type="written"]');
  const practicalInput = row.querySelector('[data-type="practical"]');
  const totalSpan = row.querySelector(".total-marks");
  const gradeSpan = row.querySelector(".grade");

  // Get max values
  const subjectData = subjects.find((s) => s.name === subject);
  const writtenMax = 100;
  const practicalMax = subjectData.practicalMax;

  // Validate and limit input values
  let written = parseInt(writtenInput.value) || 0;
  let practical = parseInt(practicalInput.value) || 0;

  // Ensure written marks don't exceed 100
  written = Math.min(Math.max(written, 0), writtenMax);
  writtenInput.value = written;

  // Handle practical marks based on written marks
  if (written > 80) {
    // If written marks > 80, disable practical marks
    practicalInput.value = 0;
    practicalInput.disabled = true;
    practicalInput.classList.add("disabled");
    practical = 0;
  } else {
    // Enable practical marks if written marks <= 80
    practicalInput.disabled = false;
    practicalInput.classList.remove("disabled");
    // Calculate remaining marks available for practical
    const remainingMarks = 100 - written;
    practical = Math.min(
      Math.max(practical, 0),
      Math.min(practicalMax, remainingMarks)
    );
    practicalInput.value = practical;
  }

  // Calculate total (should not exceed 100)
  const total = Math.min(written + practical, 100);
  totalSpan.textContent = total;
  gradeSpan.textContent = calculateGrade(total);
}

function calculateGrade(total) {
  if (total >= 90) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "B+";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  return "F";
}

function saveMarks() {
  const term = document.getElementById("termSelect").value;
  const marks = {};

  document.querySelectorAll(".marks-input").forEach((input) => {
    const subject = input.dataset.subject;
    const type = input.dataset.type;
    const value = parseInt(input.value) || 0;

    if (!marks[subject]) {
      marks[subject] = {};
    }
    marks[subject][type] = value;
  });

  // Here you would typically send this data to your backend
  console.log("Saving marks:", {
    classId: currentClass,
    rollNo: currentStudent,
    term: term,
    marks: marks,
  });

  alert("Marks saved successfully!");
  bootstrap.Modal.getInstance(document.getElementById("marksModal")).hide();
}

// Initialize with empty student list
loadStudents();
