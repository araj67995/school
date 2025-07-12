 // Parse teachers data from the JSON script tag
      const teachersData = JSON.parse(document.getElementById('teachers-data').textContent);
      const teachers = teachersData.map(function(found) {
        return {
          teacherId: found.teacherId,
          name: found.name,
          dob: found.dob,
          gender: found.gender,
          email: found.email,
          address: found.address,
          grade: found.grade,
          section: found.section,
          previous: found.previousWorking,
          father: found.father,
          mother: found.mother,
          exper: found.experience,
          salary: found.salary,
          subject: found.subject,
          status: found.status,
          joining: found.joiningDate,
          contact: found.contact
        };
      });

      let selectedTeacherId = null;

      async function viewTeacherDetails(id) {
        selectedTeacherId = id;
        const teacher = teachers.find(f => f.teacherId === id);
        if (teacher) {
          document.getElementById("teacherId").textContent = teacher.teacherId;
          document.getElementById("teacherName").textContent = teacher.name;
          document.getElementById("teacherFather").textContent = teacher.father;
          document.getElementById("teacherMother").textContent = teacher.mother;
          document.getElementById("teacherJoiningDate").textContent = teacher.joining;
          document.getElementById("teacherEmail").textContent = teacher.email;
          document.getElementById("teacherMobile").textContent = teacher.contact || "N/A";
          document.getElementById("teacherAddress").textContent = teacher.address;
          document.getElementById("teacherDob").textContent = teacher.dob;
          document.getElementById("teacherClass").textContent = teacher.grade;
          document.getElementById("teacherSubject").textContent = teacher.subject;
          document.getElementById("teacherExperience").textContent = teacher.exper;
          document.getElementById("teacherGender").textContent = teacher.gender;
          document.getElementById("teacherPrevious").textContent = teacher.previous;
          document.getElementById("teacherSection").textContent = teacher.section;
          
          // Display actual teacher status
          const status = teacher.status || "Active";
          const statusBadge = document.getElementById("teacherStatus");
          statusBadge.textContent = status;
          statusBadge.className = "status-badge " + status.toLowerCase();
        }
        // Reset month select and attendance table
        document.getElementById('monthSelect').value = '';
        document.getElementById('attendanceTableContainer').innerHTML = '';
        document.getElementById('attendanceSummary').style.display = 'none';
        
        // Set current salary
        document.getElementById('currentSalary').textContent = `₹${teacher.salary}`;
        
        // Load salary history
        await fetchSalaryHistory();
        
        const modal = new bootstrap.Modal(document.getElementById("teacherDetailsModal"));
        modal.show();
      }

      document.getElementById('monthSelect').addEventListener('change', function() {
        if (selectedTeacherId) fetchAndRenderAttendance(selectedTeacherId);
      });

      async function fetchAndRenderAttendance(teacherId) {
        const month = document.getElementById('monthSelect').value;
        if (!month) {
          document.getElementById('attendanceTableContainer').innerHTML = '';
          document.getElementById('attendanceSummary').style.display = 'none';
          return;
        }
        const year = new Date().getFullYear();
        const monthStr = `${year}-${month.padStart(2, '0')}`;
        try {
          const res = await fetch(`/admin/teacher/teacher-attendance/${teacherId}?month=${monthStr}`);
          if (!res.ok) {
            throw new Error('Failed to fetch attendance data');
          }
          const data = await res.json();
          const attendance = {};
          if (data.attendance) {
            data.attendance.forEach(a => { attendance[a.date] = a; });
          }
          const leaves = data.leaves || [];
          // Build a map of leave dates
          const leaveMap = {};
          leaves.forEach(l => {
            let current = new Date(l.fromDate);
            const end = new Date(l.toDate);
            while (current <= end) {
              const dateStr = current.toISOString().slice(0, 10);
              leaveMap[dateStr] = l;
              current.setDate(current.getDate() + 1);
            }
          });
          renderAttendanceTable(attendance, leaveMap, leaves);
          updateAttendanceSummary(attendance);
        } catch (error) {
          console.error('Error fetching attendance:', error);
          document.getElementById('attendanceTableContainer').innerHTML = '<p class="text-danger">Error loading attendance data</p>';
        }
      }

      function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
      }

      function updateAttendanceSummary(attendanceData) {
        const summary = {
          Present: 0,
          Absent: 0,
          'Half Day': 0,
          Leave: 0
        };

        // Count attendance by status
        Object.values(attendanceData).forEach(record => {
          if (summary.hasOwnProperty(record.status)) {
            summary[record.status]++;
          }
        });

        // Update the summary cards
        document.getElementById('presentCount').textContent = summary.Present;
        document.getElementById('absentCount').textContent = summary.Absent;
        document.getElementById('halfDayCount').textContent = summary['Half Day'];
        document.getElementById('leaveCount').textContent = summary.Leave;

        // Show the summary section
        document.getElementById('attendanceSummary').style.display = 'block';
      }

      function renderAttendanceTable(attendanceData, leaveMap, leaves) {
        const month = document.getElementById('monthSelect').value;
        const year = new Date().getFullYear();
        const days = daysInMonth(parseInt(month), year);
        let table = `<table class='table table-striped'><thead class='table-dark'><tr><th>Date</th><th>Status</th><th>Remark</th><th>Action</th></tr></thead><tbody>`;
        for (let d = 1; d <= days; d++) {
          const dateStr = `${year}-${month.padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
          let record = attendanceData[dateStr];
          let leave = leaveMap[dateStr];
          if (record) {
            // Already marked - show edit form
            let statusClass = 'text-secondary';
            if (record.status === 'Present') statusClass = 'text-success';
            else if (record.status === 'Absent') statusClass = 'text-danger';
            else if (record.status === 'Half Day') statusClass = 'text-warning';
            else if (record.status === 'Leave') statusClass = 'text-info';
            table += `<tr id="row-${dateStr}">
              <td>${d}</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <span class="badge ${statusClass}">${record.status}</span>
                  <select id='status-${dateStr}' class='form-select form-select-sm'>
                    <option value='Present' ${record.status === 'Present' ? 'selected' : ''}>Present</option>
                    <option value='Absent' ${record.status === 'Absent' ? 'selected' : ''}>Absent</option>
                    <option value='Half Day' ${record.status === 'Half Day' ? 'selected' : ''}>Half Day</option>
                    <option value='Leave' ${record.status === 'Leave' ? 'selected' : ''}>Leave</option>
                  </select>
                </div>
              </td>
              <td><input id='remark-${dateStr}' type='text' class='form-control form-control-sm' value="${record.remark || ''}" placeholder='Add remark'></td>
              <td>
                <button class='btn btn-sm btn-success' onclick="updateAttendance('${dateStr}')">Update</button>
                <button class='btn btn-sm btn-danger' onclick="deleteAttendance('${dateStr}')">Delete</button>
              </td>
            </tr>`;
          } else if (leave) {
            // Leave request exists
            if (leave.status === 'Pending') {
              table += `<tr><td>${d}</td><td class="text-warning"><strong>Leave (Pending)</strong></td><td>${leave.reason}</td><td><button class='btn btn-sm btn-success' onclick="approveLeave('${leave._id}')">Approve</button> <button class='btn btn-sm btn-danger' onclick="rejectLeave('${leave._id}')">Reject</button></td></tr>`;
            } else {
              const statusClass = leave.status === 'Approved' ? 'text-success' : 'text-danger';
              table += `<tr><td>${d}</td><td class="${statusClass}"><strong>Leave (${leave.status})</strong></td><td>${leave.reason}</td><td></td></tr>`;
            }
          } else {
            // Not marked
            table += `<tr><td>${d}</td><td><select id='status-${dateStr}' class='form-select form-select-sm'><option value='Present'>Present</option><option value='Absent'>Absent</option><option value='Half Day'>Half Day</option><option value='Leave'>Leave</option></select></td><td><input id='remark-${dateStr}' type='text' class='form-control form-control-sm' placeholder='Add remark'></td><td><button class='btn btn-sm btn-primary' onclick="markAttendance('${dateStr}')">Mark</button></td></tr>`;
          }
        }
        table += '</tbody></table>';
        document.getElementById('attendanceTableContainer').innerHTML = table;
      }

      async function markAttendance(date) {
        const status = document.getElementById(`status-${date}`).value;
        const remark = document.getElementById(`remark-${date}`).value;
        try {
          const response = await fetch('/admin/teacher/teacher-attendance/mark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId: selectedTeacherId, date, status, remark })
          });
          if (!response.ok) {
            throw new Error('Failed to mark attendance');
          }
          await fetchAndRenderAttendance(selectedTeacherId);
          // Show success message
          const successAlert = document.createElement('div');
          successAlert.className = 'alert alert-success alert-dismissible fade show';
          successAlert.innerHTML = `
            <strong>Success!</strong> Attendance marked successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.getElementById('attendanceTableContainer').insertAdjacentElement('beforebegin', successAlert);
          // Auto-remove after 3 seconds
          setTimeout(() => {
            if (successAlert.parentNode) {
              successAlert.remove();
            }
          }, 3000);
        } catch (error) {
          console.error('Error marking attendance:', error);
          alert('Error marking attendance. Please try again.');
        }
      }

      async function approveLeave(leaveId) {
        try {
          const response = await fetch('/admin/teacher/teacher-leave/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leaveId, status: 'Approved' })
          });
          if (!response.ok) {
            throw new Error('Failed to approve leave');
          }
          await fetchAndRenderAttendance(selectedTeacherId);
        } catch (error) {
          console.error('Error approving leave:', error);
          alert('Error approving leave. Please try again.');
        }
      }

      // Leave form submit
      const leaveForm = document.getElementById('leaveForm');
      leaveForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(leaveForm);
        const fromDate = formData.get('fromDate');
        const toDate = formData.get('toDate');
        const reason = formData.get('reason');
        try {
          const response = await fetch('/admin/teacher/apply-leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId: selectedTeacherId, fromDate, toDate, reason })
          });
          if (!response.ok) {
            throw new Error('Failed to apply leave');
          }
          leaveForm.reset();
          const modal = bootstrap.Modal.getInstance(document.getElementById('leaveModal'));
          modal.hide();
          await fetchAndRenderAttendance(selectedTeacherId);
        } catch (error) {
          console.error('Error applying leave:', error);
          alert('Error applying leave. Please try again.');
        }
      });

      async function updateAttendance(date) {
        const status = document.getElementById(`status-${date}`).value;
        const remark = document.getElementById(`remark-${date}`).value;
        try {
          const response = await fetch('/admin/teacher/teacher-attendance/mark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId: selectedTeacherId, date, status, remark })
          });
          if (!response.ok) {
            throw new Error('Failed to update attendance');
          }
          await fetchAndRenderAttendance(selectedTeacherId);
          // Show success message
          const successAlert = document.createElement('div');
          successAlert.className = 'alert alert-success alert-dismissible fade show';
          successAlert.innerHTML = `
            <strong>Success!</strong> Attendance updated successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.getElementById('attendanceTableContainer').insertAdjacentElement('beforebegin', successAlert);
          // Auto-remove after 3 seconds
          setTimeout(() => {
            if (successAlert.parentNode) {
              successAlert.remove();
            }
          }, 3000);
        } catch (error) {
          console.error('Error updating attendance:', error);
          alert('Error updating attendance. Please try again.');
        }
      }

      async function deleteAttendance(date) {
        if (!confirm('Are you sure you want to delete this attendance record?')) {
          return;
        }
        try {
          const response = await fetch('/admin/teacher/teacher-attendance/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId: selectedTeacherId, date })
          });
          if (!response.ok) {
            throw new Error('Failed to delete attendance');
          }
          await fetchAndRenderAttendance(selectedTeacherId);
          // Show success message
          const successAlert = document.createElement('div');
          successAlert.className = 'alert alert-success alert-dismissible fade show';
          successAlert.innerHTML = `
            <strong>Success!</strong> Attendance record deleted successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.getElementById('attendanceTableContainer').insertAdjacentElement('beforebegin', successAlert);
          // Auto-remove after 3 seconds
          setTimeout(() => {
            if (successAlert.parentNode) {
              successAlert.remove();
            }
          }, 3000);
        } catch (error) {
          console.error('Error deleting attendance:', error);
          alert('Error deleting attendance. Please try again.');
        }
      }

      async function rejectLeave(leaveId) {
        try {
          const response = await fetch('/admin/teacher/teacher-leave/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leaveId, status: 'Rejected' })
          });
          if (!response.ok) {
            throw new Error('Failed to reject leave');
          }
          await fetchAndRenderAttendance(selectedTeacherId);
        } catch (error) {
          console.error('Error rejecting leave:', error);
          alert('Error rejecting leave. Please try again.');
        }
      }
      
      function openLeaveModal() {
        const modal = new bootstrap.Modal(document.getElementById('leaveModal'));
        modal.show();
      }

      // Salary functions
      let selectedSalaryId = null;

      function openSalaryModal() {
        const modal = new bootstrap.Modal(document.getElementById('addSalaryModal'));
        modal.show();
        
        // Set default basic salary from teacher data
        const teacher = teachers.find(f => f.teacherId === selectedTeacherId);
        if (teacher) {
          document.getElementById('basicSalaryInput').value = teacher.salary;
        }
        
        // Add event listeners for real-time net salary calculation
        document.getElementById('basicSalaryInput').addEventListener('input', calculateNetSalary);
        document.getElementById('allowancesInput').addEventListener('input', calculateNetSalary);
        document.getElementById('deductionsInput').addEventListener('input', calculateNetSalary);
      }

      function openIncreaseSalaryModal() {
        const modal = new bootstrap.Modal(document.getElementById('increaseSalaryModal'));
        modal.show();
        
        // Clear form first
        document.getElementById('increaseSalaryForm').reset();
        document.getElementById('newSalaryDisplay').value = '';
        
        // Set current salary display
        const teacher = teachers.find(f => f.teacherId === selectedTeacherId);
        if (teacher) {
          document.getElementById('currentSalaryDisplay').value = `₹${teacher.salary}`;
        }
        
        // Remove existing event listeners to prevent duplicates
        const increaseTypeSelect = document.getElementById('increaseType');
        const increaseValueInput = document.getElementById('increaseValue');
        
        // Clone and replace elements to remove old event listeners
        const newIncreaseTypeSelect = increaseTypeSelect.cloneNode(true);
        const newIncreaseValueInput = increaseValueInput.cloneNode(true);
        
        increaseTypeSelect.parentNode.replaceChild(newIncreaseTypeSelect, increaseTypeSelect);
        increaseValueInput.parentNode.replaceChild(newIncreaseValueInput, increaseValueInput);
        
        // Add event listeners for real-time new salary calculation
        newIncreaseTypeSelect.addEventListener('change', calculateNewSalary);
        newIncreaseValueInput.addEventListener('input', calculateNewSalary);
      }
      
      function calculateNewSalary() {
        const teacher = teachers.find(f => f.teacherId === selectedTeacherId);
        if (!teacher) return;
        
        const currentSalary = parseInt(teacher.salary);
        const increaseType = document.getElementById('increaseType').value;
        const increaseValue = parseFloat(document.getElementById('increaseValue').value) || 0;
        
        let newSalary = currentSalary;
        
        if (increaseType === 'percentage') {
          newSalary = currentSalary + (currentSalary * increaseValue / 100);
        } else if (increaseType === 'fixed') {
          newSalary = currentSalary + increaseValue;
        }
        
        document.getElementById('newSalaryDisplay').value = `₹${Math.round(newSalary)}`;
      }
      
      function calculateNetSalary() {
        const basicSalary = parseInt(document.getElementById('basicSalaryInput').value) || 0;
        const allowances = parseInt(document.getElementById('allowancesInput').value) || 0;
        const deductions = parseInt(document.getElementById('deductionsInput').value) || 0;
        const netSalary = basicSalary + allowances - deductions;
        
        // Update net salary display if it exists
        const netSalaryDisplay = document.getElementById('netSalaryDisplay');
        if (netSalaryDisplay) {
          netSalaryDisplay.textContent = `₹${netSalary}`;
        }
      }

      function generateSalary() {
        const modal = new bootstrap.Modal(document.getElementById('generateSalaryModal'));
        modal.show();
      }

      async function fetchSalaryHistory() {
        if (!selectedTeacherId) return;
        
        try {
          const response = await fetch(`/admin/teacher/teacher-salary/${selectedTeacherId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch salary history');
          }
          const data = await response.json();
          renderSalaryTable(data.salaries);
        } catch (error) {
          console.error('Error fetching salary history:', error);
          document.getElementById('salaryTableContainer').innerHTML = '<p class="text-danger">Error loading salary data</p>';
        }
      }

      function renderSalaryTable(salaries) {
        if (!salaries || salaries.length === 0) {
          document.getElementById('salaryTableContainer').innerHTML = `
            <div class="text-center text-muted">
              <p>No salary records found</p>
            </div>
          `;
          return;
        }

        let table = `
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-dark">
                <tr>
                  <th style="width: 10%;">Month/Year</th>
                  <th style="width: 12%;">Basic Salary</th>
                  <th style="width: 10%;">Allowances</th>
                  <th style="width: 10%;">Deductions</th>
                  <th style="width: 12%;">Net Salary</th>
                  <th style="width: 12%;">Payment Method</th>
                  <th style="width: 10%;">Status</th>
                  <th style="width: 14%;">Actions</th>
                </tr>
              </thead>
              <tbody>
        `;

        salaries.forEach(salary => {
          // Format month/year - extract month from salary.month (format: YYYY-MM or YYYY-MM-increase-timestamp)
          let monthYear = '';
          if (salary.month.includes('-increase-')) {
            // For salary increase records, extract the original month
            const monthPart = salary.month.split('-increase-')[0];
            const month = monthPart.split('-')[1];
            monthYear = `${month}/${salary.year}`;
          } else {
            // For regular salary records
            const month = salary.month.split('-')[1];
            monthYear = `${month}/${salary.year}`;
          }
          
          const statusClass = salary.paymentStatus === 'Paid' ? 'text-success' : 
                             salary.paymentStatus === 'Pending' ? 'text-warning' : 'text-danger';
          
          table += `
            <tr>
              <td>${monthYear}</td>
              <td>₹${salary.basicSalary}</td>
              <td>₹${salary.allowances}</td>
              <td>₹${salary.deductions}</td>
              <td><strong>₹${salary.netSalary}</strong></td>
              <td>${salary.paymentMethod}</td>
              <td><span class="badge ${statusClass}">${salary.paymentStatus}</span></td>
              <td>
                <div class="btn-group" role="group">
                  <button class="btn btn-sm btn-primary" onclick="paySalary('${salary._id}')" title="Update Payment">
                    <i class="bi bi-credit-card"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="deleteSalary('${salary._id}')" title="Delete Record">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        });

                  table += '</tbody></table></div>';
          document.getElementById('salaryTableContainer').innerHTML = table;
      }

      function paySalary(salaryId) {
        selectedSalaryId = salaryId;
        const modal = new bootstrap.Modal(document.getElementById('paySalaryModal'));
        modal.show();
      }

      async function deleteSalary(salaryId) {
        if (!confirm('Are you sure you want to delete this salary record?')) {
          return;
        }
        
        try {
          const response = await fetch(`/admin/teacher/teacher-salary/delete/${salaryId}`, {
            method: 'DELETE'
          });
          if (!response.ok) {
            throw new Error('Failed to delete salary record');
          }
          await fetchSalaryHistory();
          // Show success message
          const successAlert = document.createElement('div');
          successAlert.className = 'alert alert-success alert-dismissible fade show';
          successAlert.innerHTML = `
            <strong>Success!</strong> Salary record deleted successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.getElementById('salaryTableContainer').insertAdjacentElement('beforebegin', successAlert);
          setTimeout(() => {
            if (successAlert.parentNode) {
              successAlert.remove();
            }
          }, 3000);
        } catch (error) {
          console.error('Error deleting salary record:', error);
          alert('Error deleting salary record. Please try again.');
        }
      }

      // Form event listeners
      const generateSalaryForm = document.getElementById('generateSalaryForm');
      generateSalaryForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(generateSalaryForm);
        const month = formData.get('month');
        const year = formData.get('year');
        const monthStr = `${year}-${month.padStart(2, '0')}`;
        
        try {
          const response = await fetch('/admin/teacher/teacher-salary/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId: selectedTeacherId, month: monthStr, year: parseInt(year) })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to generate salary');
          }
          
          generateSalaryForm.reset();
          const modal = bootstrap.Modal.getInstance(document.getElementById('generateSalaryModal'));
          modal.hide();
          await fetchSalaryHistory();
          
          // Show success message
          const successAlert = document.createElement('div');
          successAlert.className = 'alert alert-success alert-dismissible fade show';
          successAlert.innerHTML = `
            <strong>Success!</strong> Salary generated successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.getElementById('salaryTableContainer').insertAdjacentElement('beforebegin', successAlert);
          setTimeout(() => {
            if (successAlert.parentNode) {
              successAlert.remove();
            }
          }, 3000);
        } catch (error) {
          console.error('Error generating salary:', error);
          alert(error.message || 'Error generating salary. Please try again.');
        }
      });

      const paySalaryForm = document.getElementById('paySalaryForm');
      paySalaryForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(paySalaryForm);
        const paymentStatus = formData.get('paymentStatus');
        const paymentMethod = formData.get('paymentMethod');
        const paymentDate = formData.get('paymentDate');
        const remarks = formData.get('remarks');
        
        try {
          const response = await fetch('/admin/teacher/teacher-salary/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              salaryId: selectedSalaryId, 
              paymentStatus, 
              paymentMethod, 
              paymentDate, 
              remarks 
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to update payment status');
          }
          
          paySalaryForm.reset();
          const modal = bootstrap.Modal.getInstance(document.getElementById('paySalaryModal'));
          modal.hide();
          await fetchSalaryHistory();
          
          // Show success message
          const successAlert = document.createElement('div');
          successAlert.className = 'alert alert-success alert-dismissible fade show';
          successAlert.innerHTML = `
            <strong>Success!</strong> Payment status updated successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.getElementById('salaryTableContainer').insertAdjacentElement('beforebegin', successAlert);
          setTimeout(() => {
            if (successAlert.parentNode) {
              successAlert.remove();
            }
          }, 3000);
        } catch (error) {
          console.error('Error updating payment status:', error);
          alert('Error updating payment status. Please try again.');
        }
      });

      // Add salary form event listener
      const addSalaryForm = document.getElementById('addSalaryForm');
      addSalaryForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(addSalaryForm);
        const month = formData.get('month');
        const year = formData.get('year');
        const monthStr = `${year}-${month.padStart(2, '0')}`;
        const basicSalary = formData.get('basicSalary');
        const allowances = formData.get('allowances');
        const deductions = formData.get('deductions');
        const paymentMethod = formData.get('paymentMethod');
        const paymentStatus = formData.get('paymentStatus');
        const paymentDate = formData.get('paymentDate');
        const remarks = formData.get('remarks');
        
        try {
          const response = await fetch('/admin/teacher/teacher-salary/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              teacherId: selectedTeacherId, 
              month: monthStr, 
              year: parseInt(year), 
              basicSalary, 
              allowances, 
              deductions, 
              paymentMethod, 
              paymentStatus, 
              paymentDate, 
              remarks 
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add salary record');
          }
          
          addSalaryForm.reset();
          const modal = bootstrap.Modal.getInstance(document.getElementById('addSalaryModal'));
          modal.hide();
          await fetchSalaryHistory();
          
          // Show success message
          const successAlert = document.createElement('div');
          successAlert.className = 'alert alert-success alert-dismissible fade show';
          successAlert.innerHTML = `
            <strong>Success!</strong> Salary record added successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.getElementById('salaryTableContainer').insertAdjacentElement('beforebegin', successAlert);
          setTimeout(() => {
            if (successAlert.parentNode) {
              successAlert.remove();
            }
          }, 3000);
        } catch (error) {
          console.error('Error adding salary record:', error);
          alert(error.message || 'Error adding salary record. Please try again.');
        }
      });

      // Increase salary form event listener
      const increaseSalaryForm = document.getElementById('increaseSalaryForm');
      increaseSalaryForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form data
        const formData = new FormData(increaseSalaryForm);
        const increaseType = formData.get('increaseType');
        const increaseValue = formData.get('increaseValue');
        const effectiveDate = formData.get('effectiveDate');
        const reason = formData.get('reason');
        
        // Frontend validation
        if (!increaseType || !increaseValue || !effectiveDate || !reason.trim()) {
          alert('Please fill in all required fields');
          return;
        }
        
        if (parseFloat(increaseValue) <= 0) {
          alert('Increase value must be greater than 0');
          return;
        }
        
        console.log('Submitting salary increase:', {
          teacherId: selectedTeacherId,
          increaseType,
          increaseValue,
          effectiveDate,
          reason
        });
        
        try {
          const response = await fetch('/admin/teacher/teacher-salary/increase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              teacherId: selectedTeacherId, 
              increaseType, 
              increaseValue, 
              effectiveDate, 
              reason: reason.trim()
            })
          });
          
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            throw new Error(errorData.message || 'Failed to increase salary');
          }
          
          const data = await response.json();
          console.log('Success response:', data);
          
          increaseSalaryForm.reset();
          const modal = bootstrap.Modal.getInstance(document.getElementById('increaseSalaryModal'));
          modal.hide();
          
          // Update the current salary display in the UI
          const teacher = teachers.find(f => f.teacherId === selectedTeacherId);
          if (teacher) {
            teacher.salary = data.newSalary;
            document.getElementById('currentSalary').textContent = `₹${data.newSalary}`;
          }
          
          await fetchSalaryHistory();
          
          // Show success message
          const successAlert = document.createElement('div');
          successAlert.className = 'alert alert-success alert-dismissible fade show';
          successAlert.innerHTML = `
            <strong>Success!</strong> Salary increased from ₹${data.oldSalary} to ₹${data.newSalary}.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.getElementById('salaryTableContainer').insertAdjacentElement('beforebegin', successAlert);
          setTimeout(() => {
            if (successAlert.parentNode) {
              successAlert.remove();
            }
          }, 5000);
        } catch (error) {
          console.error('Error increasing salary:', error);
          alert(error.message || 'Error increasing salary. Please try again.');
        }
      });

      // Function to generate credentials
      function generateCredentials() {
        const username = "SR25200"; // enrollment no
        const password = Math.random().toString(36).slice(-8); // random 8-char password

        alert(
          `Credentials generated:\nUsername: ${username}\nPassword: ${password}`
        );
      }

      function addTeacher() {
        const modal = new bootstrap.Modal(
          document.getElementById("addTeacherModal")
        );
        modal.show();
      }

      // Status update modal
      async function openUpdateStatusModal() {
        const teacher = teachers.find(f => f.teacherId === selectedTeacherId);
        if (!teacher) return;

        const modal = new bootstrap.Modal(document.getElementById('updateStatusModal'));
        modal.show();

        document.getElementById('currentStatus').textContent = teacher.status;
        document.getElementById('newStatusSelect').value = teacher.status;
      }

      const updateStatusForm = document.getElementById('updateStatusForm');
      updateStatusForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const newStatus = document.getElementById('newStatusSelect').value;
        const remarks = document.getElementById('statusRemarks').value;

        try {
          const response = await fetch('/admin/teacher/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teacherId: selectedTeacherId,
              status: newStatus,
              remarks: remarks
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update status');
          }

          const data = await response.json();
          
          // Update the teacher data in the local array
          const teacher = teachers.find(f => f.teacherId === selectedTeacherId);
          if (teacher) {
            teacher.status = data.status;
          }
          
          // Update the UI
          const statusBadge = document.getElementById("teacherStatus");
          statusBadge.textContent = data.status;
          statusBadge.className = "status-badge " + data.status.toLowerCase();

          const successAlert = document.createElement('div');
          successAlert.className = 'alert alert-success alert-dismissible fade show';
          successAlert.innerHTML = `
            <strong>Success!</strong> Status updated to ${data.status}.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.getElementById('teacherDetailsModal').insertAdjacentElement('beforebegin', successAlert);
          setTimeout(() => {
            if (successAlert.parentNode) {
              successAlert.remove();
            }
          }, 3000);

          const modal = bootstrap.Modal.getInstance(document.getElementById('updateStatusModal'));
          modal.hide();
        } catch (error) {
          console.error('Error updating status:', error);
          alert(error.message || 'Error updating status. Please try again.');
        }
      });

      // Bulk Salary Generation Modal
      function openBulkSalaryModal() {
        console.log('openBulkSalaryModal called');
        const modalElement = document.getElementById('bulkSalaryModal');
        console.log('Modal element:', modalElement);
        
        if (!modalElement) {
          console.error('Bulk salary modal element not found!');
          alert('Modal element not found. Please check the page.');
          return;
        }
        
        try {
          const modal = new bootstrap.Modal(modalElement);
          console.log('Bootstrap modal instance:', modal);
          modal.show();
          console.log('Modal show() called');
        } catch (error) {
          console.error('Error opening bulk salary modal:', error);
          alert('Error opening modal: ' + error.message);
        }
      }

      async function previewBulkSalary() {
        const month = document.getElementById('bulkMonthSelect').value;
        const year = document.getElementById('bulkYearInput').value;
        const statusFilters = [];
        if (document.getElementById('statusActive').checked) statusFilters.push('Active');
        if (document.getElementById('statusOnLeave').checked) statusFilters.push('On Leave');
        if (document.getElementById('statusSuspended').checked) statusFilters.push('Suspended');
        if (document.getElementById('statusResigned').checked) statusFilters.push('Resigned');
        if (document.getElementById('statusRetired').checked) statusFilters.push('Retired');

        if (!month || !year) {
          alert('Please select Month and Year.');
          return;
        }

        if (statusFilters.length === 0) {
          alert('Please select at least one teacher status to filter.');
          return;
        }

        const teacherListDiv = document.getElementById('teacherList');
        const previewDiv = document.getElementById('bulkSalaryPreview');
        teacherListDiv.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div><p>Loading preview...</p></div>';
        previewDiv.style.display = 'block';

        try {
          const response = await fetch('/admin/teacher/bulk-salary/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              month: month,
              year: parseInt(year),
              statusFilters: statusFilters
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to preview bulk salary');
          }

          const data = await response.json();
          teacherListDiv.innerHTML = ''; // Clear loading message
          
          if (data.teachersToProcess && data.teachersToProcess.length > 0) {
            const ul = document.createElement('ul');
            ul.className = 'list-group list-group-flush';
            
            data.teachersToProcess.forEach(teacher => {
              const li = document.createElement('li');
              li.className = 'list-group-item d-flex justify-content-between align-items-center';
              li.innerHTML = `
                <div>
                  <strong>${teacher.name}</strong><br>
                  <small class="text-muted">ID: ${teacher.teacherId}</small>
                </div>
                <div class="text-end">
                  <span class="badge bg-info text-dark me-2">${teacher.status}</span>
                  <span class="badge bg-success">₹${teacher.salary}</span>
                </div>
              `;
              ul.appendChild(li);
            });
            
            teacherListDiv.appendChild(ul);
            teacherListDiv.innerHTML += `<div class="mt-3 alert alert-info"><strong>Total:</strong> ${data.totalCount} teachers will be processed.</div>`;
          } else {
            teacherListDiv.innerHTML = '<div class="alert alert-warning">No teachers found to generate salary for the selected criteria.</div>';
          }
        } catch (error) {
          console.error('Error previewing bulk salary:', error);
          teacherListDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        }
      }

      const bulkSalaryForm = document.getElementById('bulkSalaryForm');
      bulkSalaryForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const month = document.getElementById('bulkMonthSelect').value;
        const year = document.getElementById('bulkYearInput').value;
        const statusFilters = [];
        if (document.getElementById('statusActive').checked) statusFilters.push('Active');
        if (document.getElementById('statusOnLeave').checked) statusFilters.push('On Leave');
        if (document.getElementById('statusSuspended').checked) statusFilters.push('Suspended');
        if (document.getElementById('statusResigned').checked) statusFilters.push('Resigned');
        if (document.getElementById('statusRetired').checked) statusFilters.push('Retired');

        if (!month || !year) {
          alert('Please select Month and Year.');
          return;
        }

        if (statusFilters.length === 0) {
          alert('Please select at least one teacher status to filter.');
          return;
        }

        if (!confirm('Are you sure you want to generate bulk salary for the selected teachers?')) {
          return;
        }

        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Generating...';
        submitBtn.disabled = true;

        try {
          const response = await fetch('/admin/teacher/bulk-salary/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              month: month,
              year: parseInt(year),
              statusFilters: statusFilters
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to generate bulk salary');
          }

          const data = await response.json();
          
          // Show success message
          const successAlert = document.createElement('div');
          successAlert.className = 'alert alert-success alert-dismissible fade show';
          successAlert.innerHTML = `
            <strong>Success!</strong> Bulk salary generated for ${data.processedCount} teachers.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.getElementById('bulkSalaryModal').insertAdjacentElement('beforebegin', successAlert);
          setTimeout(() => {
            if (successAlert.parentNode) {
              successAlert.remove();
            }
          }, 5000);

          const modal = bootstrap.Modal.getInstance(document.getElementById('bulkSalaryModal'));
          modal.hide();
          
          // Reset form
          this.reset();
          document.getElementById('bulkSalaryPreview').style.display = 'none';
        } catch (error) {
          console.error('Error generating bulk salary:', error);
          alert(error.message || 'Error generating bulk salary. Please try again.');
        } finally {
          // Restore button state
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      });