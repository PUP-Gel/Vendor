// ============================================================
//  Dashboard.js — Market Vendor Compliance Management System
//  Data source : localStorage
//  Compliance  : Auto-computed from vendor score (0-100)
//                  >= 75  → Compliant
//                  50-74  → Need Improvement
//                  < 50   → Non-Compliant
// ============================================================

// ── Compliance Thresholds ─────────────────────────────────
const THRESHOLD = {
  COMPLIANT: 75,
  IMPROVEMENT: 50,
};

// ── Sample / Seed Data (remove after real survey is live) ──
const SEED_VENDORS = [
  {
    id: "v001",
    name: "Juan dela Cruz Store",
    category: "Food & Beverages",
    contact: "09171234567",
    dateSubmitted: "2026-04-20",
    score: 88,
  },
  {
    id: "v002",
    name: "Maria's Handicraft",
    category: "Handicraft",
    contact: "09281234567",
    dateSubmitted: "2026-04-22",
    score: 62,
  },
  {
    id: "v003",
    name: "Pedro's Fresh Produce",
    category: "Vegetables & Fruits",
    contact: "09391234567",
    dateSubmitted: "2026-04-25",
    score: 40,
  },
  {
    id: "v004",
    name: "Aling Nena's Dry Goods",
    category: "Dry Goods",
    contact: "09501234567",
    dateSubmitted: "2026-05-01",
    score: 91,
  },
  {
    id: "v005",
    name: "Mang Tomas Carinderia",
    category: "Food & Beverages",
    contact: "09611234567",
    dateSubmitted: "2026-05-03",
    score: 55,
  },
];

// ── Helpers ───────────────────────────────────────────────

/**
 * Determine compliance status from a numeric score.
 * @param {number} score  0-100
 * @returns {"Compliant"|"Need Improvement"|"Non-Compliant"}
 */
function getStatus(score) {
  if (score >= THRESHOLD.COMPLIANT) return "Compliant";
  if (score >= THRESHOLD.IMPROVEMENT) return "Need Improvement";
  return "Non-Compliant";
}

/**
 * Load vendors array from localStorage.
 * Seeds with sample data on very first run.
 */
function loadVendors() {
  const raw = localStorage.getItem("vendors");
  if (!raw) {
    // First run — seed sample data so the dashboard isn't empty
    saveVendors(SEED_VENDORS);
    return SEED_VENDORS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Persist vendors array to localStorage. */
function saveVendors(vendors) {
  localStorage.setItem("vendors", JSON.stringify(vendors));
}

/**
 * Compute dashboard metrics from a vendors array.
 */
function computeMetrics(vendors) {
  const total = vendors.length;
  let compliant = 0,
    improvement = 0,
    nonCompliant = 0;

  vendors.forEach((v) => {
    const status = getStatus(v.score);
    if (status === "Compliant") compliant++;
    else if (status === "Need Improvement") improvement++;
    else nonCompliant++;
  });

  const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

  return { total, compliant, improvement, nonCompliant, complianceRate };
}

/**
 * Extract unique product categories from vendors array.
 */
function getCategories(vendors) {
  return [...new Set(vendors.map((v) => v.category))].sort();
}

// ── DOM Update Functions ──────────────────────────────────

/** Update the 4 metric cards + warning banner. */
function renderMetrics(vendors) {
  const { total, compliant, improvement, nonCompliant, complianceRate } =
    computeMetrics(vendors);

  // Metric values
  document.querySelectorAll(".Values")[0].textContent = total;
  document.querySelectorAll(".Values")[1].textContent = compliant;
  document.querySelectorAll(".Values")[2].textContent = improvement;
  document.querySelectorAll(".Values")[3].textContent = nonCompliant;

  // Compliance rate desc
  document.querySelectorAll(".desc")[0].textContent =
    total > 0 ? `${complianceRate}% compliance rate` : "";

  // Warning banner
  const warningBox = document.getElementById("warning");
  const warningMsg = document.getElementById("warning-message");

  if (total === 0) {
    warningBox.style.backgroundColor = "#fd8702";
    warningMsg.innerHTML =
      "<p>No vendors registered yet.</p><p>Waiting for submissions...</p>";
  } else if (nonCompliant > 0) {
    warningBox.style.backgroundColor = "#e53935";
    warningMsg.innerHTML = `<p>${nonCompliant} vendor(s) are Non-Compliant.</p><p>Immediate action required.</p>`;
  } else if (improvement > 0) {
    warningBox.style.backgroundColor = "#fb8c00";
    warningMsg.innerHTML = `<p>${improvement} vendor(s) need improvement.</p><p>Follow-up recommended.</p>`;
  } else {
    warningBox.style.backgroundColor = "#43a047";
    warningMsg.innerHTML =
      "<p>All vendors are compliant! ✅</p><p>Keep up the good work.</p>";
  }
}

/** Render product category pills/tags. */
function renderCategories(vendors) {
  const categories = getCategories(vendors);
  const warningEl = document.getElementById("display-warning");
  const listEl = document.getElementById("vendor-list");

  if (categories.length === 0) {
    warningEl.style.display = "flex";
    listEl.style.display = "none";
    return;
  }

  warningEl.style.display = "none";
  listEl.style.display = "flex";

  const ul = listEl.querySelector("ul");
  ul.innerHTML = "";

  // Count vendors per category
  const counts = {};
  vendors.forEach((v) => {
    counts[v.category] = (counts[v.category] || 0) + 1;
  });

  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.classList.add("category-item");
    li.innerHTML = `
      <span class="cat-name">${cat}</span>
      <span class="cat-count">${counts[cat]} vendor${counts[cat] > 1 ? "s" : ""}</span>
    `;
    ul.appendChild(li);
  });
}

/** Build Filter & Search UI and vendor table inside #vendor-filter. */
function buildFilterSection(allVendors) {
  const filterDiv = document.getElementById("vendor-filter");

  // Keep the title, append controls + table
  filterDiv.innerHTML = `
    <p id="filter-title" class="data-title">
      <ion-icon name="funnel-outline"></ion-icon>
      Filter &amp; Search Vendors
    </p>

    <div id="filter-controls">
      <input
        type="text"
        id="search-input"
        placeholder="🔍  Search vendor name..."
        autocomplete="off"
      />
      <select id="status-filter">
        <option value="All">All Status</option>
        <option value="Compliant">Compliant</option>
        <option value="Need Improvement">Need Improvement</option>
        <option value="Non-Compliant">Non-Compliant</option>
      </select>
      <select id="category-filter">
        <option value="All">All Categories</option>
        ${getCategories(allVendors)
          .map((c) => `<option value="${c}">${c}</option>`)
          .join("")}
      </select>
    </div>

    <div id="vendor-table-wrapper">
      <table id="vendor-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Vendor Name</th>
            <th>Category</th>
            <th>Score</th>
            <th>Status</th>
            <th>Date Submitted</th>
          </tr>
        </thead>
        <tbody id="vendor-tbody"></tbody>
      </table>
      <p id="no-results" style="display:none;">No vendors match your search.</p>
    </div>
  `;

  // Wire up live filtering
  document.getElementById("search-input").addEventListener("input", () =>
    renderTable(allVendors)
  );
  document.getElementById("status-filter").addEventListener("change", () =>
    renderTable(allVendors)
  );
  document.getElementById("category-filter").addEventListener("change", () =>
    renderTable(allVendors)
  );

  // Initial render
  renderTable(allVendors);
}

/** Filter vendors and render rows in the table. */
function renderTable(allVendors) {
  const query = document
    .getElementById("search-input")
    .value.toLowerCase()
    .trim();
  const statusFilter = document.getElementById("status-filter").value;
  const categoryFilter = document.getElementById("category-filter").value;

  const filtered = allVendors.filter((v) => {
    const status = getStatus(v.score);
    const matchName = v.name.toLowerCase().includes(query);
    const matchStatus = statusFilter === "All" || status === statusFilter;
    const matchCat = categoryFilter === "All" || v.category === categoryFilter;
    return matchName && matchStatus && matchCat;
  });

  const tbody = document.getElementById("vendor-tbody");
  const noResults = document.getElementById("no-results");

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    noResults.style.display = "block";
    return;
  }

  noResults.style.display = "none";
  tbody.innerHTML = filtered
    .map(
      (v, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${v.name}</td>
      <td>${v.category}</td>
      <td>
        <div class="score-bar-wrap">
          <div class="score-bar" style="width:${v.score}%;background:${scoreColor(v.score)}"></div>
          <span>${v.score}</span>
        </div>
      </td>
      <td><span class="status-badge status-${getStatus(v.score).replace(/ /g, "-")}">${getStatus(v.score)}</span></td>
      <td>${formatDate(v.dateSubmitted)}</td>
    </tr>
  `
    )
    .join("");
}

/** Returns a color hex based on score. */
function scoreColor(score) {
  if (score >= THRESHOLD.COMPLIANT) return "#43a047";
  if (score >= THRESHOLD.IMPROVEMENT) return "#fb8c00";
  return "#e53935";
}

/** Format ISO date to readable string. */
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Export Report ─────────────────────────────────────────

/** Export vendor data as CSV file. */
function exportCSV(vendors) {
  if (vendors.length === 0) {
    alert("No vendor data to export.");
    return;
  }

  const headers = [
    "ID",
    "Vendor Name",
    "Category",
    "Contact",
    "Date Submitted",
    "Score",
    "Status",
  ];
  const rows = vendors.map((v) => [
    v.id,
    `"${v.name}"`,
    `"${v.category}"`,
    v.contact,
    v.dateSubmitted,
    v.score,
    getStatus(v.score),
  ]);

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `VendorReport_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Navigation ────────────────────────────────────────────

function setupNavigation() {
  const surveyBtn = document.getElementById("SurveyBtn");
  const dashboardBtn = document.getElementById("DashboardBtn");

  if (surveyBtn) {
    surveyBtn.addEventListener("click", () => {
      window.location.href = "Survey.html";
    });
  }

  if (dashboardBtn) {
    dashboardBtn.addEventListener("click", () => {
      window.location.href = "Dashboard.html";
    });
  }
}

// ── Inject Required CSS ───────────────────────────────────

function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* ── Category List ── */
    #vendor-list ul {
      list-style: none;
      padding: 0;
      margin: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .category-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: #f5f7fa;
      border-radius: 8px;
      font-size: 0.95rem;
    }

    .cat-name {
      font-weight: 600;
      color: #1d283a;
    }

    .cat-count {
      background: #1d283a;
      color: white;
      border-radius: 12px;
      padding: 2px 10px;
      font-size: 0.8rem;
    }

    /* ── Filter Controls ── */
    #filter-controls {
      display: flex;
      gap: 10px;
      padding: 0 3% 2% 3%;
      flex-wrap: wrap;
    }

    #search-input {
      flex: 1;
      min-width: 180px;
      padding: 10px 14px;
      border: 1.5px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }

    #search-input:focus {
      border-color: #1d283a;
    }

    #status-filter,
    #category-filter {
      padding: 10px 14px;
      border: 1.5px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: inherit;
      background: white;
      cursor: pointer;
      outline: none;
    }

    /* ── Vendor Table ── */
    #vendor-table-wrapper {
      padding: 0 3% 3% 3%;
      overflow-x: auto;
    }

    #vendor-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    #vendor-table thead tr {
      background: #1d283a;
      color: white;
    }

    #vendor-table th,
    #vendor-table td {
      padding: 10px 14px;
      text-align: left;
    }

    #vendor-table tbody tr:nth-child(even) {
      background: #f9f9f9;
    }

    #vendor-table tbody tr:hover {
      background: #eef2ff;
    }

    /* ── Score Bar ── */
    .score-bar-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .score-bar-wrap > div {
      height: 8px;
      border-radius: 4px;
      max-width: 80px;
    }

    .score-bar-wrap > span {
      font-weight: bold;
      font-size: 0.85rem;
    }

    /* ── Status Badges ── */
    .status-badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: bold;
      white-space: nowrap;
    }

    .status-Compliant {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-Need-Improvement {
      background: #fff3e0;
      color: #e65100;
    }

    .status-Non-Compliant {
      background: #ffebee;
      color: #c62828;
    }

    /* ── No Results ── */
    #no-results {
      text-align: center;
      color: #aaa;
      padding: 20px;
      font-style: italic;
    }
  `;
  document.head.appendChild(style);
}

// ── Main Init ─────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  injectStyles();
  setupNavigation();

  const vendors = loadVendors();

  renderMetrics(vendors);
  renderCategories(vendors);
  buildFilterSection(vendors);

  // Export button
  const exportBtn = document.getElementById("ExportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => exportCSV(vendors));
  }
});