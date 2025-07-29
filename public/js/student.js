const marks = marksData.map((foundMarks) => ({
  id: foundMarks.enrollmentNo,
  marksId: foundMarks._id,
  term: foundMarks.term,
  createdAt: foundMarks.createdAt,
  subjects: foundMarks.subjects.map((subj) => ({
    subject: subj.subject,
    theory: subj.theory,
    practical: subj.practical,
    total: subj.total,
    grade: subj.grade,
  })),
}));

// Helper function to get term title
function getTermTitle(term) {
  const termMap = {
    'term1': 'First Term',
    'term2': 'Second Term',
    'term3': 'Third Term',
    'term4': 'Fourth Term'
  };
  return termMap[term] || term.charAt(0).toUpperCase() + term.slice(1) + ' Term';
}

// Add any interactive functionality here
document.addEventListener("DOMContentLoaded", function () {
  // Example: Add click event for download buttons
  document.querySelectorAll(".primary-btn").forEach((button) => {
    button.addEventListener("click", function () {
      alert("Download will start shortly...");
    });
  });
  
  // Initialize marksheet if data is available
  if (marks.length > 0) {
    updateMarksheet();
  }
});

function downloadMarksheet() {
  const term = document.getElementById("termSelector").value;
  const termInfo = document.querySelector(".term-title").textContent;
  alert(`Downloading ${termInfo} marksheet...`);
  // Add actual download functionality here
}

function downloadReceipt(month) {
  alert(`Downloading payment receipt for ${month}...`);
  // Add actual download functionality here
}

function downloadAllPayments() {
  alert("Downloading complete payment history...");
  // Add actual download functionality here
}

function updateMarksheet() {
  const termValue = document.getElementById("termSelector").value;
  const termInfo = document.querySelector(".term-info");
  const marksTable = document.querySelector(".marks-table tbody");

  const foundTerm = marks.find((m) => m.term === termValue);

  if (!foundTerm) {
    marksTable.innerHTML = "<tr><td colspan='5'>No data available for selected term</td></tr>";
    termInfo.innerHTML = `
      <h4 class="term-title">No data available</h4>
      <p class="term-date">Please select a different term</p>
    `;
    return;
  }

  const marksArray = foundTerm.subjects.map((subj) => [
    subj.subject,
    `${subj.theory}`,
    `${subj.practical}`,
    `${subj.total}`,
    subj.grade.join(", "),
  ]);

  const totalObtained = foundTerm.subjects.reduce((sum, subj) => sum + subj.total, 0);
  const totalMax = foundTerm.subjects.length * 100;
  const percentage = ((totalObtained / totalMax) * 100).toFixed(2) + "%";

  const createdAt = new Date(foundTerm.createdAt);
  const formattedDate = createdAt.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const termTitle = getTermTitle(termValue);

  termInfo.innerHTML = `
    <h4 class="term-title">${termTitle}</h4>
    <p class="term-date">${formattedDate}</p>
  `;

  updateMarks(marksTable, marksArray, percentage);
}

function updateMarks(table, marks, percentage) {
  table.innerHTML = marks
    .map(
      (mark) => `
                <tr>
                    <td>${mark[0]}</td>
                    <td>${mark[1]}</td>
                    <td>${mark[2]}</td>
                    <td>${mark[3]}</td>
                    <td class="grade">${mark[4]}</td>
                </tr>
            `
    )
    .join("");

  table.innerHTML += `
    <tr class="total-row">
        <td colspan="3"><strong>Total Percentage</strong></td>
        <td colspan="2"><strong>${percentage}</strong></td>
    </tr>
  `;
}
