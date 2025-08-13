  // Leave management functions
  function showLeaveMessage(message, type = "success") {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".leave-message");
    existingMessages.forEach((msg) => msg.remove());
    // Create new message
    const messageDiv = document.createElement("div");
    messageDiv.className = `leave-message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 3000);
  }
  async function approveLeave(leaveId) {
    try {
      const response = await fetch("/admin/teacher-leave/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, status: "Approved" }),
      });
      if (!response.ok) {
        throw new Error("Failed to approve leave");
      }
      await fetchAndRenderAttendance(selectedTeacherId);
    } catch (error) {
      console.error("Error approving leave:", error);
      alert("Error approving leave. Please try again.");
    }
  }
  async function rejectLeave(leaveId) {
    try {
      const response = await fetch("/admin/teacher-leave/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, status: "Rejected" }),
      });
      if (!response.ok) {
        throw new Error("Failed to reject leave");
      }
      await fetchAndRenderAttendance(selectedTeacherId);
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert("Error rejecting leave. Please try again.");
    }
  }
  function updateLeaveRow(leaveId, status) {
    const row = document.querySelector(`tr[data-leave-id="${leaveId}"]`);
    if (row) {
      // Update status badge
      const statusCell = row.querySelector(".leave-status-badge");
      if (statusCell) {
        statusCell.textContent = status;
        statusCell.className = `leave-status-badge ${status.toLowerCase()}`;
      }
      // Update actions cell
      const actionsCell = row.querySelector("td:last-child");
      if (actionsCell) {
        actionsCell.innerHTML = '<span class="text-muted">No actions available</span>';
      }
    }
  }
  // Enhanced table functionality
  document.addEventListener("DOMContentLoaded", function () {
    // Add hover effects to table rows
    const tableRows = document.querySelectorAll(".table tbody tr");
    tableRows.forEach((row) => {
      row.addEventListener("mouseenter", function () {
        this.style.backgroundColor = "rgba(26, 35, 126, 0.05)";
      });
      row.addEventListener("mouseleave", function () {
        this.style.backgroundColor = "";
      });
    });
    // Add responsive table wrapper if needed
    const tables = document.querySelectorAll(".table");
    tables.forEach((table) => {
      if (!table.parentElement.classList.contains("table-responsive")) {
        const wrapper = document.createElement("div");
        wrapper.className = "table-responsive";
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
  });