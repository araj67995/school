// Sample data
const students = [
  {
    id: 1,
    enrollmentNo: "ENR2024001",
    name: "John Doe",
    fathersName: "James Doe",
    mothersName: "Mary Doe",
    joiningDate: "2024-01-15",
    email: "john.doe@example.com",
    mobile: "+91 9876543210",
    address: "123 Main Street, City, State - 123456",
    status: "Active",
    class: "10A",
  },
  {
    id: 2,
    enrollmentNo: "ENR2024002",
    name: "Jane Smith",
    fathersName: "Robert Smith",
    mothersName: "Elizabeth Smith",
    joiningDate: "2024-01-20",
    email: "jane.smith@example.com",
    mobile: "+91 9876543211",
    address: "456 Oak Street, City, State - 123456",
    status: "Active",
    class: "9B",
  },
];

const teachers = [
  {
    id: 1,
    teacherId: "T2024001",
    name: "Sarah Johnson",
    fathersName: "Michael Johnson",
    mothersName: "Patricia Johnson",
    joiningDate: "2024-01-01",
    email: "sarah.johnson@example.com",
    mobile: "+91 9876543212",
    address: "789 Pine Street, City, State - 123456",
    status: "Active",
    subject: "Mathematics",
  },
  {
    id: 2,
    teacherId: "T2024002",
    name: "David Wilson",
    fathersName: "Thomas Wilson",
    mothersName: "Susan Wilson",
    joiningDate: "2024-01-05",
    email: "david.wilson@example.com",
    mobile: "+91 9876543213",
    address: "321 Maple Street, City, State - 123456",
    status: "Active",
    subject: "Science",
  },
];

// Function to show different sections
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.style.display = "none";
  });

  // Show selected section
  document.getElementById(sectionId).style.display = "block";

  // Update active nav link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  event.currentTarget.classList.add("active");

  // Load section-specific data
  if (sectionId === "students") {
    loadStudents();
  } else if (sectionId === "teachers") {
    loadTeachers();
  } else if (sectionId === "admissions") {
    loadPendingAdmissions();
  }
}

// Function to load students
function loadStudents() {
  const tbody = document.getElementById("studentTableBody");
  tbody.innerHTML = students
    .map(
      (student) => `
        <tr>
          <td>${student.enrollmentNo}</td>
          <td>${student.name}</td>
          <td>${student.fathersName}</td>
          <td>${student.class}</td>
          <td><span class="status-badge ${student.status.toLowerCase()}">${
        student.status
      }</span></td>
          <td>
            <button class="action-btn edit" onclick="viewStudentDetails(${
              student.id
            })">
              <i class="bi bi-eye"></i> View
            </button>
            <button class="action-btn generate" onclick="generateCredentials(${
              student.id
            }, 'student')">
              <i class="bi bi-key"></i> Generate
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

// Function to load teachers
function loadTeachers() {
  const tbody = document.getElementById("teacherTableBody");
  tbody.innerHTML = teachers
    .map(
      (teacher) => `
        <tr>
          <td>${teacher.teacherId}</td>
          <td>${teacher.name}</td>
          <td>${teacher.subject}</td>
          <td><span class="status-badge ${teacher.status.toLowerCase()}">${
        teacher.status
      }</span></td>
          <td>
            <button class="action-btn edit" onclick="viewTeacherDetails(${
              teacher.id
            })">
              <i class="bi bi-eye"></i> View
            </button>
            <button class="action-btn generate" onclick="generateCredentials(${
              teacher.id
            }, 'teacher')">
              <i class="bi bi-key"></i> Generate
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

// Function to filter students by class
function filterStudents() {
  const selectedClass = document.getElementById("classFilter").value;
  const filteredStudents = selectedClass
    ? students.filter((student) => student.class === selectedClass)
    : students;

  const tbody = document.getElementById("studentTableBody");
  tbody.innerHTML = filteredStudents
    .map(
      (student) => `
        <tr>
          <td>${student.enrollmentNo}</td>
          <td>${student.name}</td>
          <td>${student.fathersName}</td>
          <td>${student.class}</td>
          <td><span class="status-badge ${student.status.toLowerCase()}">${
        student.status
      }</span></td>
          <td>
            <button class="action-btn edit" onclick="viewStudentDetails(${
              student.id
            })">
              <i class="bi bi-eye"></i> View
            </button>
            <button class="action-btn generate" onclick="generateCredentials(${
              student.id
            }, 'student')">
              <i class="bi bi-key"></i> Generate
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

// Function to view student details
function viewStudentDetails(studentId) {
  const student = students.find((s) => s.id === studentId);
  if (student) {
    // Populate student details
    document.getElementById("studentEnrollment").textContent = student.enrollmentNo;
    document.getElementById("studentName").textContent = student.name;
    document.getElementById("studentFather").textContent = student.fathersName;
    document.getElementById("studentMother").textContent = student.mothersName;
    document.getElementById("studentJoiningDate").textContent = student.joiningDate;
    document.getElementById("studentEmail").textContent = student.email;
    document.getElementById("studentMobile").textContent = student.mobile;
    document.getElementById("studentAddress").textContent = student.address;

    // Set status badge
    const statusBadge = document.getElementById("studentStatus");
    statusBadge.textContent = student.status;
    statusBadge.className = "status-badge " + student.status.toLowerCase();

    const modal = new bootstrap.Modal(document.getElementById("studentDetailsModal"));
    modal.show();
  }
}

// Function to view teacher details
function viewTeacherDetails(teacherId) {
  const teacher = teachers.find((t) => t.id === teacherId);
  if (teacher) {
    // Populate teacher details
    document.getElementById("teacherId").textContent = teacher.teacherId;
    document.getElementById("teacherName").textContent = teacher.name;
    document.getElementById("teacherFather").textContent = teacher.fathersName;
    document.getElementById("teacherMother").textContent = teacher.mothersName;
    document.getElementById("teacherJoiningDate").textContent = teacher.joiningDate;
    document.getElementById("teacherEmail").textContent = teacher.email;
    document.getElementById("teacherMobile").textContent = teacher.mobile;
    document.getElementById("teacherAddress").textContent = teacher.address;

    // Set status badge
    const statusBadge = document.getElementById("teacherStatus");
    statusBadge.textContent = teacher.status;
    statusBadge.className = "status-badge " + teacher.status.toLowerCase();

    const modal = new bootstrap.Modal(document.getElementById("teacherDetailsModal"));
    modal.show();
  }
}

// Function to generate credentials
function generateCredentials(id, type) {
  const user = type === "student" ? students.find((s) => s.id === id) : teachers.find((t) => t.id === id);

  if (user) {
    const username = type === "student" ? user.enrollmentNo : user.teacherId;
    const password = Math.random().toString(36).slice(-8); // Generate random password

    alert(`Credentials generated:\nUsername: ${username}\nPassword: ${password}`);
    // Here you would typically send these credentials to the backend
  }
}

// Function to show direct admission modal
function showDirectAdmissionModal() {
  const modal = new bootstrap.Modal(document.getElementById("directAdmissionModal"));
  modal.show();
}

// Function to review admission
function reviewAdmission(admissionId) {
  const admission = pendingAdmissions.find((a) => a.id === admissionId);
  if (admission) {
    const modal = new bootstrap.Modal(document.getElementById("pendingAdmissionModal"));
    // Populate form with admission data
    const form = document.getElementById("pendingAdmissionForm");
    // Set form values...
    modal.show();
  }
}

// Function to submit direct admission
function submitDirectAdmission() {
  const form = document.getElementById("directAdmissionForm");
  if (form.checkValidity()) {
    // Handle form submission
    alert("Direct admission submitted successfully!");
    bootstrap.Modal.getInstance(document.getElementById("directAdmissionModal")).hide();
  } else {
    form.reportValidity();
  }
}

// Function to approve admission
function approveAdmission() {
  // Handle admission approval
  alert("Admission approved successfully!");
  bootstrap.Modal.getInstance(document.getElementById("pendingAdmissionModal")).hide();
}

// Function to reject admission
function rejectAdmission() {
  // Handle admission rejection
  alert("Admission rejected!");
  bootstrap.Modal.getInstance(document.getElementById("pendingAdmissionModal")).hide();
}

// Function to load admission details
async function loadAdmissionDetails(id) {
  try {
    const response = await fetch(`/admin/admission/${id}`);
    const admission = await response.json();
    
    // Populate the form with admission details
    document.getElementById('review-name').value = admission.name;
    document.getElementById('review-lastname').value = admission.lastname;
    document.getElementById('review-dob').value = admission.dob;
    document.getElementById('review-gender').value = admission.gender;
    document.getElementById('review-email').value = admission.email;
    document.getElementById('review-phone').value = admission.phone;
    document.getElementById('review-address').value = admission.address;
    document.getElementById('review-grade').value = admission.grade;
    document.getElementById('review-previous-school').value = admission.previousSchool;
    document.getElementById('review-parent-name').value = admission.parent;
    document.getElementById('review-parent-phone').value = admission.parentNo;
    document.getElementById('review-parent-email').value = admission.parentEmail;
    
    // Show the review modal
    const reviewModal = new bootstrap.Modal(document.getElementById('reviewAdmissionModal'));
    reviewModal.show();
  } catch (error) {
    console.error('Error loading admission details:', error);
    alert('Error loading admission details');
  }
}

// Function to approve admission
async function approveAdmission(id) {
  try {
    const response = await fetch(`/admin/admission/approve/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Admission approved successfully');
      // Close the modal
      const reviewModal = bootstrap.Modal.getInstance(document.getElementById('reviewAdmissionModal'));
      reviewModal.hide();
      // Refresh the admissions list
      loadAdmissions();
    } else {
      alert('Error approving admission');
    }
  } catch (error) {
    console.error('Error approving admission:', error);
    alert('Error approving admission');
  }
}

// Function to reject admission
async function rejectAdmission(id) {
  try {
    const response = await fetch(`/admin/admission/reject/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Admission rejected successfully');
      // Close the modal
      const reviewModal = bootstrap.Modal.getInstance(document.getElementById('reviewAdmissionModal'));
      reviewModal.hide();
      // Refresh the admissions list
      loadAdmissions();
    } else {
      alert('Error rejecting admission');
    }
  } catch (error) {
    console.error('Error rejecting admission:', error);
    alert('Error rejecting admission');
  }
}

// Function to load admissions
async function loadAdmissions() {
  try {
    const response = await fetch('/admin');
    const data = await response.json();
    
    const admissionsList = document.getElementById('admissionsList');
    admissionsList.innerHTML = '';
    
    data.forEach(admission => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${admission.studentID}</td>
        <td>${admission.name} ${admission.lastname}</td>
        <td>${admission.grade}</td>
        <td>${admission.status}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="loadAdmissionDetails('${admission._id}')">
            Review
          </button>
        </td>
      `;
      admissionsList.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading admissions:', error);
  }
}

// Function to load students
async function loadStudents() {
  try {
    const response = await fetch('/admin/students');
    const students = await response.json();
    
    const studentsList = document.getElementById('studentsList');
    studentsList.innerHTML = '';
    
    students.forEach(student => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.enrollmentNo}</td>
        <td>${student.name} ${student.lastname}</td>
        <td>${student.grade}</td>
        <td>${student.status}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="showStudentDetails('${student._id}')">
            View Details
          </button>
        </td>
      `;
      studentsList.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading students:', error);
  }
}

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", function () {
  // Show dashboard section by default
  showSection("dashboard");
}); 