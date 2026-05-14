// registration form
const registrationForm = document.querySelector("#Form-content form");
if (registrationForm) {
    registrationForm.addEventListener("submit", function(e) {
        e.preventDefault();
        console.log("Form submitted!");
 
        const businessName = document.querySelector("#Buisness-name-input input").value;
        const permitNumber = document.querySelector("#Healt-permit-input input").value;
        const category = document.querySelector("#product-category").value;
        const sanitation = document.querySelector("input[name='sanitary']:checked").value;
        
        const cleanlinessCheckboxes = document.querySelectorAll("input[name='cleanliness']:checked");
        const cleanliness = Array.from(cleanlinessCheckboxes).map(cb => cb.value);
 
        console.log("Data to send:", { businessName, permitNumber, category, sanitation, cleanliness });
 
        fetch("http://localhost:3000/register-vendor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessName, permitNumber, category, sanitation, cleanliness })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Response:", data);
            alert("Registered successfully!");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Error registering vendor");
        });
    });
}
 
// dashboard 
function loadDashboard() {
    console.log("Loading dashboard...");
    
    fetch("http://localhost:3000/vendors")
        .then(res => res.json())
        .then(data => {
            console.log("Dashboard data:", data);
 
            // I-update ang metric cards
            document.querySelector("#total-vendors .Values").textContent = data.total;
            document.querySelector("#total-compliant .Values").textContent = data.compliant;
            document.querySelector("#total-improvement .Values").textContent = data.improvement;
            document.querySelector("#non-compliant .Values").textContent = data.nonCompliant;
 
            // I-update ang category counts
            document.querySelectorAll("#vendor-list .vendor-value")[0].textContent = data.categories.school;
            document.querySelectorAll("#vendor-list .vendor-value")[1].textContent = data.categories.office;
            document.querySelectorAll("#vendor-list .vendor-value")[2].textContent = data.categories.food;
            document.querySelectorAll("#vendor-list .vendor-value")[3].textContent = data.categories.clothing;
            document.querySelectorAll("#vendor-list .vendor-value")[4].textContent = data.categories.electronics;
 
            // I-update ang Priority Actions warning based sa at-risk vendors
            updatePriorityWarning(data);
 
            loadVendorTable();
        })
        .catch(err => console.error("Error loading dashboard:", err));
}
 
// I-UPDATE ANG PRIORITY ACTIONS WARNING
function updatePriorityWarning(data) {
    const warningBox = document.querySelector("#warning");
    const warningMessage = document.querySelector("#warning-message");
 
    
    if (data.total === 0) {
        warningBox.style.display = "flex";
        warningMessage.innerHTML = `
            <p>No vendors registered yet.</p>
            <p>Waiting for submissions...</p>
        `;
        return;
    }
 
    // Kung may non-compliant o need improvement show
    const atRiskCount = data.nonCompliant + data.improvement;
    
    if (atRiskCount > 0) {
        warningBox.style.display = "flex";
        const message = atRiskCount === 1 
            ? `1 vendor needs immediate attention`
            : `${atRiskCount} vendors need immediate attention`;
        
        warningMessage.innerHTML = `
            <p>${message}</p>
            <p>Non-Compliant: ${data.nonCompliant} | Need Improvement: ${data.improvement}</p>
        `;
    } else {
        
        warningBox.style.display = "none";
    }
}
 
// pang search ng vendor
function loadVendorTable() {
    const search = document.querySelector("#search-input")?.value || "";
    const status = document.querySelector("#all-statuses")?.value || "";
    const product = document.querySelector("#all-products")?.value || "";
 
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (product) params.append("product", product);
 
    fetch(`http://localhost:3000/vendor-list?${params}`)
        .then(res => res.json())
        .then(data => {
            console.log("Vendor list:", data);
 
            const table = document.querySelector("#vendor-list-content table");
            let tbody = table.querySelector("tbody");
            
            if (!tbody) {
                tbody = document.createElement("tbody");
                table.appendChild(tbody);
            }
 
            tbody.innerHTML = "";
 
            data.vendors.forEach(vendor => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${vendor.name}</td>
                    <td>${vendor.category}</td>
                    <td>${vendor.permitNumber}</td>
                `;
                tbody.appendChild(row);
            });
 
            const showingText = document.querySelector(".data-content-filter p");
            if (showingText) {
                showingText.textContent = `Showing ${data.total} vendors`;
            }
        })
        .catch(err => console.error("Error loading vendor list:", err));
}
 
// EXPORT TO CSV FUNCTION
function exportToCSV() {
    fetch("http://localhost:3000/vendors")
        .then(res => res.json())
        .then(data => {
            
            return fetch("http://localhost:3000/vendor-list");
        })
        .then(res => res.json())
        .then(data => {
            // Gumawa ng CSV header
            let csv = "Business Name,Product Category,Permit Number,Sanitation Status\n";
 
            // Idagdag ang bawat vendor sa CSV
            data.vendors.forEach(vendor => {
                const name = `"${vendor.name}"`;
                const category = `"${vendor.category}"`;
                const permit = `"${vendor.permitNumber}"`;
                const status = `"${vendor.sanitation}"`;
                
                csv += `${name},${category},${permit},${status}\n`;
            });
 
            // Gumawa ng blob at download
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            
            link.setAttribute("href", url);
            link.setAttribute("download", `vendor-report-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = "hidden";
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log("CSV exported successfully");
        })
        .catch(err => {
            console.error("Error exporting CSV:", err);
            alert("Error exporting report");
        });
}
 
// LOAD DASHBOARD WHEN PAGE LOADS
document.addEventListener("DOMContentLoaded", function() {
    console.log("Page loaded");
    
   
    if (document.querySelector("#total-vendors")) {
        loadDashboard();
        
      
        document.querySelector("#search-input")?.addEventListener("change", loadVendorTable);
        document.querySelector("#all-statuses")?.addEventListener("change", loadVendorTable);
        document.querySelector("#all-products")?.addEventListener("change", loadVendorTable);
 
        
        const exportBtn = document.querySelector("#ExportBtn");
        if (exportBtn) {
            exportBtn.addEventListener("click", exportToCSV);
        }
    }
});
 
