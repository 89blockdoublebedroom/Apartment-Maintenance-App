// Updated Apartment Maintenance App Script with Monthly Usages Feature

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();
const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const flatsPerFloor = 12;
const totalFloors = 9;
const profileState = { mode: 'user' };
let selectedYear = 2024;
let allYears = [selectedYear];
const statusOptions = ["Paid", "Unpaid", "Not Allocated"];
const adminPassword = "admin123";
let isAdminLoggedIn = false;

let yearWiseData = {
  [selectedYear]: Array.from({ length: totalFloors * flatsPerFloor }, (_, i) => ({
    flat: 101 + (i % flatsPerFloor) + (Math.floor(i / flatsPerFloor) * 100),
    status: months.map((_, idx) => idx <= 8 ? "Not Allocated" : "Unpaid")
  }))
};

let usageEntries = []; // { reason: '', charge: 0, comments: '' }

function showLoginPopup() {
  document.getElementById('admin-login').style.display = 'flex';
}
function hideLoginPopup() {
  document.getElementById('admin-login').style.display = 'none';
}
function verifyPassword() {
  const input = document.getElementById('adminPassword').value;
  if (input === adminPassword) {
    profileState.mode = 'admin';
    isAdminLoggedIn = true;
    hideLoginPopup();
    renderTable();
  } else {
    alert('Incorrect password!');
  }
}
function switchProfile(mode) {
  profileState.mode = mode;
  renderTable();
}
function addNewYear() {
  const newYear = Math.max(...allYears) + 1;
  allYears.push(newYear);
  yearWiseData[newYear] = Array.from({ length: totalFloors * flatsPerFloor }, (_, i) => ({
    flat: 101 + (i % flatsPerFloor) + (Math.floor(i / flatsPerFloor) * 100),
    status: months.map(() => "Unpaid")
  }));
  updateYearDropdown();
  selectedYear = newYear;
  renderTable();
}
function updateYearDropdown() {
  const yearSelect = document.getElementById('yearSelect');
  yearSelect.innerHTML = allYears.map(y => `<option value="${y}" ${y === selectedYear ? 'selected' : ''}>${y}</option>`).join('');
  yearSelect.onchange = () => {
    selectedYear = parseInt(yearSelect.value);
    if (profileState.mode === 'usage') {
      showUsage();
    } else {
      renderTable();
    }
  };
}
function renderTable() {
  updateYearDropdown();

  const isAdmin = profileState.mode === 'admin';
  const isUser = profileState.mode === 'user';

  document.getElementById('yearSelect').disabled = false;
  document.getElementById('usage-container').style.display = 'none';
  document.getElementById('monthly-usage-container').style.display = 'none';

  document.querySelector('button[onclick="addNewYear()"]').style.display = isAdmin ? 'inline-block' : 'none';

  const flatData = yearWiseData[selectedYear];
  let html = '<table><tr><th>Flat No</th>';
  months.forEach(month => html += `<th>${month}</th>`);
  html += '<th>Paid (₹)</th><th>Unpaid (₹)</th></tr>';

  let totalPaid = 0;
  let totalUnpaid = 0;

  flatData.forEach(row => {
    html += `<tr><td>${row.flat}</td>`;
    let paidCount = 0;
    let unpaidCount = 0;

    row.status.forEach((val, idx) => {
      const isCurrentYear = selectedYear === currentYear;
      const isCurrent = idx === currentMonth && isCurrentYear;
      const isFutureMonth = idx > currentMonth && isCurrentYear;

      let cellClass = val.toLowerCase().replace(" ", "-");
      if (isCurrent && val === 'Unpaid') cellClass += ' current-unpaid';

      if (isAdmin) {
        html += `<td class="${cellClass}">
          <select style="background-color:#dff0ff; border-radius:4px; padding:4px; border:1px solid #ccc;" onchange="updateStatus(${row.flat}, ${idx}, this.value)">
            ${statusOptions.map(opt => `<option ${opt === val ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>
        </td>`;
      } else {
        html += `<td class="${cellClass}">${val}</td>`;
      }

      if (selectedYear < currentYear || (isCurrentYear && idx <= currentMonth)) {
        if (val === "Paid") paidCount++;
        if (val === "Unpaid") unpaidCount++;
      }
    });

    const paidAmt = paidCount * 1000;
    const unpaidAmt = unpaidCount * 1000;
    totalPaid += paidAmt;
    totalUnpaid += unpaidAmt;

    html += `<td><b>₹${paidAmt}</b></td><td><b>₹${unpaidAmt}</b></td></tr>`;
  });

  if (isUser) {
    html += `<tr style="background-color:#f0f0f0; font-weight: bold;">
      <td colspan="${months.length + 1}" style="text-align: right;">Total for ${selectedYear}:</td>
      <td style="background-color:#e0f7e9;">₹${totalPaid}</td>
      <td style="background-color:#ffe0e0;">₹${totalUnpaid}</td>
    </tr>`;
  }

  html += '</table>';
  document.getElementById('table-container').innerHTML = html;

  let bottomControls = '';
  if (isAdmin) {
    bottomControls += '<button class="admin" onclick="saveChanges()">💾 Save Changes</button>';
    bottomControls += `<div style="margin-top: 20px;">
      <input type="text" id="reasonInput" placeholder="Reason">
      <input type="number" id="chargeInput" placeholder="Charge (₹)">
      <input type="text" id="commentInput" placeholder="Comments">
      <button onclick="addUsageEntry()">➕ Add Usage</button>
    </div>`;
  }
  document.getElementById('save-button-container').innerHTML = bottomControls;
}
function updateStatus(flatNo, monthIdx, value) {
  const flat = yearWiseData[selectedYear].find(f => f.flat === flatNo);
  if (flat) flat.status[monthIdx] = value;
}
function saveChanges() {
  alert('Changes saved successfully for year ' + selectedYear + '!');
  renderTable();
}
function showUsage() {
  profileState.mode = 'usage';
  updateYearDropdown();
  document.getElementById('yearSelect').disabled = true;
  document.querySelector('button[onclick="addNewYear()"]')?.style?.setProperty('display', 'none');
  document.getElementById('table-container').innerHTML = '';
  document.getElementById('save-button-container').innerHTML = '';
  document.getElementById('monthly-usage-container').style.display = 'none';
  document.getElementById('usage-container').style.display = 'block';

  const flatNumbers = Array.from({ length: totalFloors * flatsPerFloor }, (_, i) =>
    101 + (i % flatsPerFloor) + (Math.floor(i / flatsPerFloor) * 100)
  );

  const flatTotals = flatNumbers.map(flatNo => ({ flat: flatNo, paid: 0, unpaid: 0 }));

  allYears.forEach(year => {
    const isCurrent = year === currentYear;
    const maxMonth = isCurrent ? currentMonth : 11;
    if (yearWiseData[year]) {
      yearWiseData[year].forEach((flatData, idx) => {
        for (let m = 0; m <= maxMonth; m++) {
          const val = flatData.status[m];
          if (val === 'Paid') flatTotals[idx].paid += 1000;
          else if (val === 'Unpaid') flatTotals[idx].unpaid += 1000;
        }
      });
    }
  });

  let html = '<h3>Paid/Unpaid Balance</h3>';
  html += '<table><tr><th>Flat No</th><th>Total Pending Amount (₹)</th><th>Total Paid Amount (₹)</th></tr>';
  flatTotals.forEach(row => {
    html += `<tr>
      <td>${row.flat}</td>
      <td style="background-color:#ffe0e0;">₹${row.unpaid}</td>
      <td style="background-color:#e0f7e9;">₹${row.paid}</td>
    </tr>`;
  });
  html += '</table>';

  document.getElementById('usage-container').innerHTML = html;
}
function showMonthlyUsages() {
  profileState.mode = 'monthly-usage';
  document.getElementById('yearSelect').disabled = true;
  document.querySelector('button[onclick="addNewYear()"]')?.style?.setProperty('display', 'none');
  document.getElementById('table-container').innerHTML = '';
  document.getElementById('save-button-container').innerHTML = '';
  document.getElementById('usage-container').style.display = 'none';

  const totalCollected = calculateTotalCollected();
  const totalCharges = usageEntries.reduce((sum, entry) => sum + entry.charge, 0);
  const currentBalance = totalCollected - totalCharges;

  let html = `<h3>Current Balance: ₹${currentBalance}</h3>`;

  html += '<table><tr><th>Reason</th><th>Charges (₹)</th><th>Balance After</th><th>Comments</th></tr>';
  let runningBalance = totalCollected;
  usageEntries.forEach(entry => {
    runningBalance -= entry.charge;
    html += `<tr><td>${entry.reason}</td><td>₹${entry.charge}</td><td>₹${runningBalance}</td><td>${entry.comments}</td></tr>`;
  });
  html += '</table>';

  document.getElementById('monthly-usage-container').innerHTML = html;
  document.getElementById('monthly-usage-container').style.display = 'block';
}
function addUsageEntry() {
  const reason = document.getElementById('reasonInput').value.trim();
  const charge = parseFloat(document.getElementById('chargeInput').value);
  const comments = document.getElementById('commentInput').value.trim();

  if (!reason || isNaN(charge)) {
    alert('Please enter a valid reason and charge amount.');
    return;
  }

  usageEntries.push({ reason, charge, comments });
  showMonthlyUsages();
}
function calculateTotalCollected() {
  let total = 0;
  allYears.forEach(year => {
    const isCurrent = year === currentYear;
    const maxMonth = isCurrent ? currentMonth : 11;
    if (yearWiseData[year]) {
      yearWiseData[year].forEach(flat => {
        for (let m = 0; m <= maxMonth; m++) {
          if (flat.status[m] === 'Paid') total += 1000;
        }
      });
    }
  });
  return total;
}

// Initial render
renderTable();
