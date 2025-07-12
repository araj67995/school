// Add any interactive functionality here
document.addEventListener("DOMContentLoaded", function () {
  // Example: Add click event for download buttons
  document.querySelectorAll(".primary-btn").forEach((button) => {
    button.addEventListener("click", function () {
      alert("Download will start shortly...");
    });
  });
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
  const term = document.getElementById("termSelector").value;
  const termInfo = document.querySelector(".term-info");
  const marksTable = document.querySelector(".marks-table tbody");

  // Update term information
  switch (term) {
    case "first":
      termInfo.innerHTML = `
                        <h4 class="term-title">First Term Examination</h4>
                        <p class="term-date">August 2023</p>
                    `;
      // Update marks for first term
      updateMarks(
        marksTable,
        [
          ["Mathematics", "75/80", "10/20", "85/100", "A"],
          ["Science", "70/80", "22/20", "92/100", "A+"],
          ["English", "65/80", "13/20", "78/100", "B+"],
          ["History", "72/80", "16/20", "88/100", "A"],
        ],
        "85.75%"
      );
      break;
    case "mid":
      termInfo.innerHTML = `
                        <h4 class="term-title">Mid Term Examination</h4>
                        <p class="term-date">November 2023</p>
                    `;
      // Update marks for mid term
      updateMarks(
        marksTable,
        [
          ["Mathematics", "78/80", "18/20", "96/100", "A+"],
          ["Science", "75/80", "20/20", "95/100", "A+"],
          ["English", "70/80", "15/20", "85/100", "A"],
          ["History", "76/80", "18/20", "94/100", "A+"],
        ],
        "92.50%"
      );
      break;
    case "final":
      termInfo.innerHTML = `
                        <h4 class="term-title">Final Term Examination</h4>
                        <p class="term-date">March 2024</p>
                    `;
      // Update marks for final term
      updateMarks(
        marksTable,
        [
          ["Mathematics", "80/80", "20/20", "100/100", "A+"],
          ["Science", "78/80", "20/20", "98/100", "A+"],
          ["English", "75/80", "18/20", "93/100", "A+"],
          ["History", "79/80", "19/20", "98/100", "A+"],
        ],
        "97.25%"
      );
      break;
  }
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

  // Add total percentage row
  table.innerHTML += `
                <tr class="total-row">
                    <td colspan="3"><strong>Total Percentage</strong></td>
                    <td colspan="2"><strong>${percentage}</strong></td>
                </tr>
            `;
}

// Initialize marksheet with first term data
document.addEventListener("DOMContentLoaded", function () {
  updateMarksheet();
});
