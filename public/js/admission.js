// Sample data for pending admissions
const pendingAdmissions = foundData.map((foundItem) => ({
  id: foundItem._id,
  studentName: `${foundItem.name} ${foundItem.lastname}`,
  fathersName: foundItem.parent,
  motherName: foundItem.mother,
  dob: foundItem.dob,
  gender: foundItem.gender,
  class: foundItem.grade,
  contact: foundItem.phone,
  email: foundItem.email,
  parentNo: foundItem.parentNo,
  parentEmail: foundItem.parentEmail,
  previousSchool: foundItem.previousSchool,
  address: foundItem.address,
  documents: {
    marksheet: foundItem.document.includes("previousReport"),
    id: foundItem.document.includes("idProof"),
    clc: foundItem.document.includes("clc"),
  },
}));

function showDirectAdmissionModal() {
  const modal = new bootstrap.Modal(
    document.getElementById("directAdmissionModal")
  );
  modal.show();
}

function reviewAdmission(admissionId) {
  const admission = pendingAdmissions.find((a) => a.id === admissionId);
  if (admission) {
    const modal = new bootstrap.Modal(
      document.getElementById("pendingAdmissionModal")
    );
    const form = document.getElementById("pendingAdmissionForm");

    // Populate form with admission data
    form.elements["studentName"].value = admission.studentName;
    form.elements["fathersName"].value = admission.fathersName;
    form.elements["mothersName"].value = admission.motherName;
    // ✅ Fix DOB format
    const dob = new Date(admission.dob).toISOString().split("T")[0];
    form.elements["dob"].value = dob;

    // ✅ Ensure these values are set after DOM loads
    setTimeout(() => {
      form.elements["gender"].value = admission.gender;
      form.elements["grade"].value = admission.class;
    }, 0); // ✅ Fix Gender and Class select fields

    form.elements["contact"].value = admission.contact;
    form.elements["email"].value = admission.email;
    form.elements["parentContact"].value = admission.parentNo;
    form.elements["parentEmail"].value = admission.parentEmail;

    form.elements["previousSchool"].value = admission.previousSchool;

    form.elements["address"].value = admission.address;
    form.elements["_id"].value = admission.id;

    // Set document checkboxes
    form.elements["documents"].forEach((checkbox) => {
      checkbox.checked = admission.documents[checkbox.value];
    });

    modal.show();
  }
}

function submitDirectAdmission() {
  const form = document.getElementById("directAdmissionForm");
  if (form.checkValidity()) {
    // Handle form submission
    alert("Direct admission submitted successfully!");
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("directAdmissionModal")
    );
    modal.hide();
    form.reset();
  } else {
    form.reportValidity();
  }
}

function approveAdmission() {
  // Handle admission approval
  alert("Admission approved successfully!");
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("pendingAdmissionModal")
  );
  modal.hide();
}

function rejectAdmission() {
  // Handle admission rejection
  alert("Admission rejected!");
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("pendingAdmissionModal")
  );
  modal.hide();
}
