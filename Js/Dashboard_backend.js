// ============================================================
//  dashboard_backend.js
//  Replaces Dashboard.js — now fetches from Express API
//  API Base: http://localhost:3000/api
// ============================================================

const API = 'http://localhost:3000/api';

// ── Compliance thresholds (must match server.js) ──────────
const THRESHOLD = { COMPLIANT: 75, IMPROVEMENT: 50 };

function getStatus(score) {
    if (score >= THRESHOLD.COMPLIANT) return 'Compliant';
    if (score >= THRESHOLD.IMPROVEMENT) return 'Need Improvement';
    return 'Non-Compliant';
}

function scoreColor(score) {
    if (score >= THRESHOLD.COMPLIANT) return '#43a047';
    if (score >= THRESHOLD.IMPROVEMENT) return '#fb8c00';
    return '#e53935';
}

function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Inject required CSS ───────────────────────────────────
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
    #vendor-list ul {
      list-style: none; padding: 0; margin: 0;
      width: 100%; display: flex; flex-direction: column; gap: 10px;
    }
    .category-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 16px; background: #f5f7fa; border-radius: 8px; font-size: .95rem;
    }
    .cat-name { font-weight: 600; color: #1d283a; }
    .cat-count { background: #1d283a; color: white; border-radius: 12px; padding: 2px 10px; font-size: .8rem; }

    #filter-controls { display: flex; gap: 10px; padding: 0 3% 2% 3%; flex-wrap: wrap; }
    #search-input {
      flex: 1; min-width: 180px; padding: 10px 14px;
      border: 1.5px solid #ddd; border-radius: 8px;
      font-size: .9rem; font-family: inherit; outline: none; transition: border-color .2s;
    }
    #search-input:focus { border-color: #1d283a; }
    #status-filter, #category-filter {
      padding: 10px 14px; border: 1.5px solid #ddd; border-radius: 8px;
      font-size: .9rem; font-family: inherit; background: white; cursor: pointer; outline: none;
    }

    #vendor-table-wrapper { padding: 0 3% 3% 3%; overflow-x: auto; }
    #vendor-table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    #vendor-table thead tr { background: #1d283a; color: white; }
    #vendor-table th, #vendor-table td { padding: 10px 14px; text-align: left; }
    #vendor-table tbody tr:nth-child(even) { background: #f9f9f9; }
    #vendor-table tbody tr:hover { background: #eef2ff; }

    .score-bar-wrap { display: flex; align-items: center; gap: 8px; }
    .score-bar-wrap > div { height: 8px; border-radius: 4px; max-width: 80px; }
    .score-bar-wrap > span { font-weight: bold; font-size: .85rem; }

    .status-badge { padding: 4px 10px; border-radius: 20px; font-size: .78rem; font-weight: bold; white-space: nowrap; }
    .status-Compliant         { background: #e8f5e9; color: #2e7d32; }
    .status-Need-Improvement  { background: #fff3e0; color: #e65100; }
    .status-Non-Compliant     { background: #ffebee; color: #c62828; }

    #no-results { text-align: center; color: #aaa; padding: 20px; font-style: italic; }

    .delete-btn {
      background: none; border: none; cursor: pointer;
      color: #e53935; font-size: .8rem; padding: 4px 8px;
      border-radius: 6px; transition: background .15s;
    }
    .delete-btn:hover { background: #ffebee; }

    #loading-overlay {
      text-align: center; padding: 30px;
      color: #888; font-style: italic; font-size: .9rem;
    }
  `;
    document.head.appendChild(style);
}

// ── Fetch metrics from API and update cards ───────────────
async function renderMetrics() {
    try {
        const res = await fetch(`${API}/metrics`);
        const data = await res.json();

        const vals = document.querySelectorAll('.Values');
        if (vals[0]) vals[0].textContent = data.total;
        if (vals[1]) vals[1].textContent = data.compliant;
        if (vals[2]) vals[2].textContent = data.needImprovement;
        if (vals[3]) vals[3].textContent = data.nonCompliant;

        const descs = document.querySelectorAll('.desc');
        if (descs[0]) descs[0].textContent = `${data.complianceRate}% compliance rate`;

        // Warning banner
        const warningBox = document.getElementById('warning');
        const warningMsg = document.getElementById('warning-message');
        if (!warningBox || !warningMsg) return;

        if (data.total === 0) {
            warningBox.style.backgroundColor = '#fd8702';
            warningMsg.innerHTML = '<p>No vendors registered yet.</p><p>Waiting for submissions...</p>';
        } else if (data.nonCompliant > 0) {
            warningBox.style.backgroundColor = '#e53935';
            warningMsg.innerHTML = `<p>${data.nonCompliant} vendor(s) are Non-Compliant.</p><p>Immediate action required.</p>`;
        } else if (data.needImprovement > 0) {
            warningBox.style.backgroundColor = '#fb8c00';
            warningMsg.innerHTML = `<p>${data.needImprovement} vendor(s) need improvement.</p><p>Follow-up recommended.</p>`;
        } else {
            warningBox.style.backgroundColor = '#43a047';
            warningMsg.innerHTML = '<p>All vendors are compliant! ✅</p><p>Keep up the good work.</p>';
        }

        // Categories
        renderCategories(data.categories);

    } catch (err) {
        console.error('renderMetrics error:', err);
        showApiError();
    }
}

// ── Render product category list ──────────────────────────
function renderCategories(categories) {
    const warningEl = document.getElementById('display-warning');
    const listEl = document.getElementById('vendor-list');
    if (!warningEl || !listEl) return;

    if (!categories || categories.length === 0) {
        warningEl.style.display = 'flex';
        listEl.style.display = 'none';
        return;
    }

    warningEl.style.display = 'none';
    listEl.style.display = 'flex';

    const ul = listEl.querySelector('ul');
    ul.innerHTML = '';
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.className = 'category-item';
        li.innerHTML = `<span class="cat-name">${cat}</span>`;
        ul.appendChild(li);
    });
}

// ── Build filter section and vendor table ─────────────────
async function buildFilterSection() {
    const filterDiv = document.getElementById('vendor-filter');
    if (!filterDiv) return;

    // Get categories for dropdown
    let categories = [];
    try {
        const res = await fetch(`${API}/metrics`);
        const data = await res.json();
        categories = data.categories || [];
    } catch (_) { }

    filterDiv.innerHTML = `
    <p id="filter-title" class="data-title">
      <ion-icon name="funnel-outline"></ion-icon>
      Filter &amp; Search Vendors
    </p>
    <div id="filter-controls">
      <input type="text" id="search-input" placeholder="🔍  Search vendor name..." autocomplete="off" />
      <select id="status-filter">
        <option value="All">All Status</option>
        <option value="Compliant">Compliant</option>
        <option value="Need Improvement">Need Improvement</option>
        <option value="Non-Compliant">Non-Compliant</option>
      </select>
      <select id="category-filter">
        <option value="All">All Categories</option>
        ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
    </div>
    <div id="vendor-table-wrapper">
      <div id="loading-overlay">Loading vendors...</div>
      <table id="vendor-table" style="display:none">
        <thead>
          <tr>
            <th>#</th>
            <th>Vendor Name</th>
            <th>Stall</th>
            <th>Category</th>
            <th>Score</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="vendor-tbody"></tbody>
      </table>
      <p id="no-results" style="display:none;">No vendors match your search.</p>
    </div>
  `;

    // Load vendors then wire up filters
    await loadAndRenderTable();

    document.getElementById('search-input').addEventListener('input', filterTable);
    document.getElementById('status-filter').addEventListener('change', filterTable);
    document.getElementById('category-filter').addEventListener('change', filterTable);
}

// ── All vendors stored in memory for client-side filtering ─
let ALL_VENDORS = [];

async function loadAndRenderTable() {
    try {
        const res = await fetch(`${API}/vendors`);
        ALL_VENDORS = await res.json();
        document.getElementById('loading-overlay').style.display = 'none';
        document.getElementById('vendor-table').style.display = 'table';
        renderTableRows(ALL_VENDORS);
    } catch (err) {
        document.getElementById('loading-overlay').textContent =
            '❌ Cannot connect to server. Make sure Node.js is running.';
    }
}

function filterTable() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const statusFilter = document.getElementById('status-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;

    const filtered = ALL_VENDORS.filter(v => {
        const matchName = v.name.toLowerCase().includes(query);
        const matchStatus = statusFilter === 'All' || v.status === statusFilter;
        const matchCat = categoryFilter === 'All' || v.category === categoryFilter;
        return matchName && matchStatus && matchCat;
    });

    renderTableRows(filtered);
}

function renderTableRows(vendors) {
    const tbody = document.getElementById('vendor-tbody');
    const noResult = document.getElementById('no-results');

    if (vendors.length === 0) {
        tbody.innerHTML = '';
        noResult.style.display = 'block';
        return;
    }

    noResult.style.display = 'none';
    tbody.innerHTML = vendors.map((v, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${v.name}</td>
      <td>${v.stall_number}</td>
      <td>${v.category}</td>
      <td>
        <div class="score-bar-wrap">
          <div class="score-bar" style="width:${v.score}%;background:${scoreColor(v.score)}"></div>
          <span>${v.score}</span>
        </div>
      </td>
      <td><span class="status-badge status-${v.status.replace(/ /g, '-')}">${v.status}</span></td>
      <td>${formatDate(v.date_submitted)}</td>
      <td>
        <button class="delete-btn" onclick="deleteVendor(${v.id}, '${v.name}')">
          &#x1F5D1; Delete
        </button>
      </td>
    </tr>
  `).join('');
}

// ── Delete vendor ─────────────────────────────────────────
async function deleteVendor(id, name) {
    if (!confirm(`Delete vendor "${name}"? This cannot be undone.`)) return;
    try {
        const res = await fetch(`${API}/vendors/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        ALL_VENDORS = ALL_VENDORS.filter(v => v.id !== id);
        filterTable();
        await renderMetrics(); // refresh counts
    } catch (err) {
        alert('Failed to delete vendor. Check server connection.');
    }
}

// ── Export CSV ────────────────────────────────────────────
function exportCSV() {
    if (ALL_VENDORS.length === 0) { alert('No vendor data to export.'); return; }

    const headers = ['ID', 'Vendor Name', 'Stall', 'Category', 'Contact', 'Score', 'Status', 'Date Submitted'];
    const rows = ALL_VENDORS.map(v => [
        v.id, `"${v.name}"`, `"${v.stall_number}"`, `"${v.category}"`,
        v.contact, v.score, v.status, v.date_submitted,
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VendorReport_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Show API connection error ─────────────────────────────
function showApiError() {
    const warningMsg = document.getElementById('warning-message');
    if (warningMsg) {
        warningMsg.innerHTML = '<p>❌ Cannot connect to server.</p><p>Make sure Node.js is running on port 3000.</p>';
        document.getElementById('warning').style.backgroundColor = '#e53935';
    }
}

// ── Navigation ────────────────────────────────────────────
function setupNavigation() {
    const surveyBtn = document.getElementById('SurveyBtn');
    const dashboardBtn = document.getElementById('DashboardBtn');
    const exportBtn = document.getElementById('ExportBtn');

    if (surveyBtn) surveyBtn.addEventListener('click', () => window.location.href = '/Survey.html');
    if (dashboardBtn) dashboardBtn.addEventListener('click', () => window.location.href = '/Dashboard.html');
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    injectStyles();
    setupNavigation();
    await renderMetrics();
    await buildFilterSection();
});